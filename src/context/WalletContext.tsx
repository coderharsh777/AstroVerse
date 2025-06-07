
"use client";

import type { Nft, WalletState } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import { useToast } from '@/hooks/use-toast';

// --- IMPORTANT: CONFIGURATION ---
// TODO: Replace with your ACTUAL contract addresses and target network ID
const ASTRO_TOKEN_ADDRESS = "0xTokenAddress"; // Replace with your Deployed Astro Token Contract Address
const ASTRO_NFT_ADDRESS = "0xNFTAddress";     // Replace with your Deployed Astro NFT Contract Address
const TARGET_NETWORK_ID = "11155111"; // Example: Sepolia Testnet. Replace with your target network (e.g., "1" for Ethereum Mainnet)
const TARGET_NETWORK_NAME = "Sepolia Testnet"; // Example: "Ethereum Mainnet"

const ASTRO_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];
const ASTRO_NFT_ABI = [
  "function mintNFT(string memory tokenURI) public",
  "function walletOfOwner(address _owner) public view returns (uint256[] memory)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)"
];
// --- END CONFIGURATION ---

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  approveAstroTokens: (amount: number) => Promise<boolean>;
  mintAstroNft: (metadataUri: string) => Promise<boolean>;
  fetchWalletData: (addressToFetchFor: string) => Promise<void>; // Parameter added
  checkAllowance: (spenderAddress: string, amount: number) => Promise<boolean>;
  targetNetworkName: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [astroBalance, setAstroBalance] = useState<number>(0);
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Combined loading state
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getProvider = useCallback(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
  }, []);

  const getSigner = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      setError("MetaMask not found.");
      return null;
    }
    try {
      return await provider.getSigner();
    } catch (e) {
      setError("Could not get signer. Make sure your wallet is unlocked and connected.");
      return null;
    }
  }, [getProvider]);

  const getAstroTokenContract = useCallback((providerOrSigner: ethers.Provider | ethers.Signer) => {
    return new Contract(ASTRO_TOKEN_ADDRESS, ASTRO_TOKEN_ABI, providerOrSigner);
  }, []);

  const getAstroNftContract = useCallback((providerOrSigner: ethers.Provider | ethers.Signer) => {
    return new Contract(ASTRO_NFT_ADDRESS, ASTRO_NFT_ABI, providerOrSigner);
  }, []);

  const checkNetwork = async (provider: ethers.BrowserProvider): Promise<boolean> => {
    const network = await provider.getNetwork();
    if (network.chainId.toString() !== TARGET_NETWORK_ID) {
      const errMsg = `Please connect to the ${TARGET_NETWORK_NAME} (Chain ID: ${TARGET_NETWORK_ID}). You are currently on ${network.name} (Chain ID: ${network.chainId}).`;
      setError(errMsg);
      toast({ title: "Wrong Network", description: errMsg, variant: "destructive", duration: 7000 });
      return false;
    }
    setError(null); // Clear network error if correct
    return true;
  };

  const fetchWalletData = useCallback(async (addressToFetchFor: string) => {
    if (!addressToFetchFor) {
      // console.warn("fetchWalletData called without an address.");
      return;
    }

    setLoading(true);
    // setError(null); // Error is reset by checkNetwork or at start of connectWallet etc.

    const provider = getProvider();
    if (!provider) {
      setError("MetaMask not found.");
      setLoading(false);
      return;
    }

    if (!await checkNetwork(provider)) {
      setLoading(false);
      // Clear data if network is wrong to avoid showing stale data from another network
      setAstroBalance(0);
      setNfts([]);
      return;
    }

    try {
      const tokenContract = getAstroTokenContract(provider);
      const balanceBigInt = await tokenContract.balanceOf(addressToFetchFor);
      const formattedBalance = parseFloat(ethers.formatEther(balanceBigInt));
      setAstroBalance(formattedBalance);

      // --- MOCK NFT DATA (Remove/replace with actual fetching) ---
      const mockNfts: Nft[] = [
        { id: "1", name: "Supernova Spectacle", description: "Witness the birth of new elements.", image: "https://placehold.co/300x300/242959/FFFFFF.png?text=NFT+1", event: {id: "sn1987a", name: "Supernova 1987A", date: "1987-02-23T07:35:00Z"}, metadataUri: "ipfs://QmExampleHash1"},
        { id: "2", name: "Eclipse Elegance", description: "A dance of celestial bodies.", image: "https://placehold.co/300x300/7B62FF/FFFFFF.png?text=NFT+2", event: {id: "eclipse2024", name: "Total Solar Eclipse 2024", date: "2024-04-08T18:17:00Z"}, metadataUri: "ipfs://QmExampleHash2"},
      ];
      // TODO: Implement actual NFT fetching logic here using addressToFetchFor
      setNfts(mockNfts); // Using mock data for now

      toast({ title: "Wallet Data Updated", description: `Balance for ${addressToFetchFor.substring(0,6)}...: ${formattedBalance.toFixed(4)} ASTRO` });
    } catch (err: any) {
      console.error("Error fetching wallet data:", err);
      const displayError = err.reason || err.message || "Failed to fetch wallet data. Ensure you are on the correct network and contract addresses are valid.";
      setError(displayError);
      toast({ title: "Error Fetching Data", description: displayError, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [getProvider, toast, getAstroTokenContract, getAstroNftContract]); // Removed `address` from dependencies

  // Effect for initializing address from localStorage or using a default for development
  useEffect(() => {
    const DEV_DEFAULT_ADDRESS = "0x0fE810267f02D7AbA8Ac7dD763ff534d8d6a8CF8";
    let initialAddressToUse: string | null = localStorage.getItem('walletAddress');

    if (!initialAddressToUse) {
      // For development convenience, if no address is stored, use the specified one.
      // In a real production app, you might not want this behavior
      // or guard it with a development environment flag.
      initialAddressToUse = DEV_DEFAULT_ADDRESS;
      localStorage.setItem('walletAddress', initialAddressToUse); // Persist this dev address for subsequent loads
      console.warn(`WalletContext: No stored address found. Using default development address: ${initialAddressToUse}. Connect via MetaMask to use a different account.`);
    }
    
    if (initialAddressToUse) {
      setAddress(initialAddressToUse);
      fetchWalletData(initialAddressToUse);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchWalletData]); // fetchWalletData is now stable

  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    const provider = getProvider();
    if (!provider) {
      const msg = "MetaMask is not installed. Please install it to continue.";
      setError(msg);
      toast({ title: "MetaMask Not Found", description: msg, variant: "destructive" });
      setLoading(false);
      return;
    }
    try {
      if (!await checkNetwork(provider)) {
        setLoading(false);
        return;
      }
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts && accounts.length > 0) {
        const newAddress = accounts[0];
        setAddress(newAddress);
        localStorage.setItem('walletAddress', newAddress);
        toast({ title: "Wallet Connected", description: `Connected to ${newAddress.substring(0,6)}...${newAddress.substring(newAddress.length-4)}` });
        await fetchWalletData(newAddress);
      } else {
        setError("No accounts found. Please ensure your wallet is set up correctly.");
        toast({ title: "Connection Issue", description: "No accounts found in MetaMask.", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Failed to connect wallet:", err);
      const displayError = err.message || "Failed to connect wallet.";
      setError(displayError);
      toast({ title: "Connection Failed", description: displayError, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setAstroBalance(0);
    setNfts([]);
    setError(null);
    localStorage.removeItem('walletAddress');
    toast({ title: "Wallet Disconnected" });
  }, [toast]);
  
  useEffect(() => {
    const provider = getProvider();
    if (!provider || !window.ethereum || !window.ethereum.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        const newAddress = accounts[0];
        setAddress(newAddress);
        localStorage.setItem('walletAddress', newAddress);
        fetchWalletData(newAddress);
        toast({ title: "Account Changed", description: `Switched to ${newAddress.substring(0,6)}...${newAddress.substring(newAddress.length-4)}` });
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = async (_chainId: string) => {
      toast({ title: "Network Changed", description: "Verifying network and reloading data..." });
      const currentProvider = getProvider();
      if (currentProvider) {
        const wasCorrectNetwork = await checkNetwork(currentProvider); // This will set error if wrong
        if (wasCorrectNetwork) {
          // Try to get current signer and address to reload data
          try {
            const signer = await currentProvider.getSigner();
            const currentWalletAddress = await signer.getAddress();
            setAddress(currentWalletAddress); // Ensure address state is up-to-date
            fetchWalletData(currentWalletAddress);
          } catch (e) {
            console.error("Could not get signer after chain change, disconnecting.", e);
            disconnectWallet();
          }
        } else {
          // checkNetwork already set an error and toasted. Clear local data.
          setAstroBalance(0);
          setNfts([]);
          // If an address was set, keep it, but data will be empty/error shown
        }
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [disconnectWallet, fetchWalletData, getProvider, toast]);


  const checkAllowance = async (spenderAddress: string, amount: number): Promise<boolean> => {
    if (!address) {
      return false;
    }
    const provider = getProvider();
    if (!provider) {
      return false;
    }
    if (!await checkNetwork(provider)) return false;

    try {
      const tokenContract = getAstroTokenContract(provider);
      const amountNeeded = ethers.parseEther(amount.toString());
      const currentAllowance = await tokenContract.allowance(address, spenderAddress);
      return currentAllowance >= amountNeeded;
    } catch (err: any) {
      console.error("Error checking allowance:", err);
      setError(err.message || "Failed to check token allowance.");
      return false;
    }
  };


  const approveAstroTokens = async (amount: number): Promise<boolean> => {
    if (!address) {
      toast({ title: "Error", description: "Please connect your wallet first.", variant: "destructive" });
      return false;
    }
    setLoading(true);
    setError(null);
    
    const provider = getProvider();
    if (!provider) {
        setError("MetaMask not found.");
        setLoading(false);
        return false;
    }
    if (!await checkNetwork(provider)) {
        setLoading(false);
        return false;
    }

    try {
      const signer = await getSigner();
      if (!signer) {
        setError("Could not get signer. Wallet might be locked or disconnected.");
        setLoading(false);
        return false;
      }
      
      const tokenContract = getAstroTokenContract(signer);
      const amountToApprove = ethers.parseEther(amount.toString());
      
      toast({ title: "Approval Pending", description: "Please approve the token spending in MetaMask." });
      const tx = await tokenContract.approve(ASTRO_NFT_ADDRESS, amountToApprove);
      await tx.wait();
      
      toast({ title: "Approval Successful", description: `${amount} ASTRO tokens approved for AstroNFT contract.` });
      // Re-check allowance for UI update (or expect parent component to do it)
      // await checkAllowance(ASTRO_NFT_ADDRESS, amount); // Optional: directly update state if needed
      setLoading(false);
      return true;
    } catch (err: any)
    {
      console.error("Error approving tokens:", err);
      const displayError = err.reason || err.code || err.message || "Failed to approve tokens.";
      setError(displayError);
      toast({ title: "Approval Failed", description: displayError, variant: "destructive" });
      setLoading(false);
      return false;
    }
  };

  const mintAstroNft = async (metadataUri: string): Promise<boolean> => {
    if (!address) {
      toast({ title: "Error", description: "Please connect your wallet first.", variant: "destructive" });
      return false;
    }
    setLoading(true);
    setError(null);

    const provider = getProvider();
    if (!provider) {
        setError("MetaMask not found.");
        setLoading(false);
        return false;
    }
    if (!await checkNetwork(provider)) {
        setLoading(false);
        return false;
    }

    try {
      const signer = await getSigner();
      if (!signer) {
        setError("Could not get signer. Wallet might be locked or disconnected.");
        setLoading(false);
        return false;
      }

      const nftContract = getAstroNftContract(signer);
      
      toast({ title: "Minting Pending", description: "Please confirm the minting transaction in MetaMask." });
      const tx = await nftContract.mintNFT(metadataUri);
      const receipt = await tx.wait();
      
      toast({ title: "NFT Minted!", description: `Transaction successful: ${receipt.hash.substring(0,10)}...` });
      await fetchWalletData(address); // Refresh wallet data for current address
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error("Error minting NFT:", err);
      const displayError = err.reason || err.code || err.message || "Failed to mint NFT.";
      setError(displayError);
      toast({ title: "Minting Failed", description: displayError, variant: "destructive" });
      setLoading(false);
      return false;
    }
  };


  return (
    <WalletContext.Provider value={{ 
        address, 
        astroBalance, 
        nfts, 
        loading, 
        error, 
        connectWallet, 
        disconnectWallet, 
        approveAstroTokens, 
        mintAstroNft, 
        fetchWalletData, 
        checkAllowance,
        targetNetworkName: TARGET_NETWORK_NAME 
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum?: any; 
  }
}


    