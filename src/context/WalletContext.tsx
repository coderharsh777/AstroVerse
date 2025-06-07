
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
  "function allowance(address owner, address spender) view returns (uint256)" // Note: ethers.js v6 uses uint256, not uint250
];
const ASTRO_NFT_ABI = [
  "function mintNFT(string memory tokenURI) public",
  "function walletOfOwner(address _owner) public view returns (uint256[] memory)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)" // For fetching metadata URI
];
// --- END CONFIGURATION ---

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  approveAstroTokens: (amount: number) => Promise<boolean>;
  mintAstroNft: (metadataUri: string) => Promise<boolean>;
  fetchWalletData: () => Promise<void>;
  checkAllowance: (spenderAddress: string, amount: number) => Promise<boolean>;
  targetNetworkName: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [astroBalance, setAstroBalance] = useState<number>(0);
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
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
    return true;
  };

  const fetchWalletData = useCallback(async (currentAddress?: string) => {
    const addrToUse = currentAddress || address;
    if (!addrToUse) return;

    setLoading(true);
    setError(null); // Clear previous errors

    const provider = getProvider();
    if (!provider) {
      setError("MetaMask not found.");
      setLoading(false);
      return;
    }

    if (!await checkNetwork(provider)) {
      setLoading(false);
      return;
    }

    try {
      // Fetch ASTRO balance
      const tokenContract = getAstroTokenContract(provider);
      const balanceBigInt = await tokenContract.balanceOf(addrToUse);
      const formattedBalance = parseFloat(ethers.formatEther(balanceBigInt));
      setAstroBalance(formattedBalance);

      // Fetch NFTs
      const nftContract = getAstroNftContract(provider);
      // const ownedTokenIds: ethers.BigNumberish[] = await nftContract.walletOfOwner(addrToUse);
      
      // --- MOCK NFT DATA (Remove/replace with actual fetching) ---
      // In a real app, you would iterate through ownedTokenIds, call nftContract.tokenURI(tokenId),
      // fetch metadata from IPFS/HTTP, parse it, and then create Nft objects.
      const mockNfts: Nft[] = [
        { id: "1", name: "Supernova Spectacle", description: "Witness the birth of new elements.", image: "https://placehold.co/300x300/242959/FFFFFF.png?text=NFT+1", event: {id: "sn1987a", name: "Supernova 1987A", date: "1987-02-23T07:35:00Z"}, metadataUri: "ipfs://QmExampleHash1"},
        { id: "2", name: "Eclipse Elegance", description: "A dance of celestial bodies.", image: "https://placehold.co/300x300/7B62FF/FFFFFF.png?text=NFT+2", event: {id: "eclipse2024", name: "Total Solar Eclipse 2024", date: "2024-04-08T18:17:00Z"}, metadataUri: "ipfs://QmExampleHash2"},
      ];
      // TODO: Replace mockNfts with actual NFT fetching logic:
      // const fetchedNfts: Nft[] = await Promise.all(
      //   ownedTokenIds.map(async (tokenId: ethers.BigNumberish) => {
      //     try {
      //       const metadataUri = await nftContract.tokenURI(tokenId.toString());
      //       // const response = await fetch(ipfsGatewayUrl(metadataUri)); // ipfsGatewayUrl helper needed
      //       // const metadata = await response.json();
      //       // return {
      //       //   id: tokenId.toString(),
      //       //   name: metadata.name,
      //       //   description: metadata.description,
      //       //   image: ipfsGatewayUrl(metadata.image),
      //       //   event: { id: metadata.event?.id || "unknown", name: metadata.event?.name || "Unknown Event", date: metadata.event?.date || new Date().toISOString() },
      //       //   metadataUri: metadataUri
      //       // };
      //       // This is a placeholder for the above logic
      //        return {
      //          id: tokenId.toString(),
      //          name: `Astro NFT #${tokenId.toString()}`,
      //          description: "An amazing astrophysical event NFT.",
      //          image: `https://placehold.co/300x300/242959/FFFFFF.png?text=NFT+${tokenId.toString()}`,
      //          event: { id: "mockEvent", name: "Mock Event", date: new Date().toISOString() },
      //          metadataUri: `ipfs://mockhash/${tokenId.toString()}`
      //        };
      //     } catch (e) {
      //       console.error(`Failed to fetch metadata for token ID ${tokenId.toString()}:`, e);
      //       return null; // Or some error placeholder NFT
      //     }
      //   })
      // );
      // setNfts(fetchedNfts.filter(nft => nft !== null) as Nft[]);
      setNfts(mockNfts);
      // --- END MOCK NFT DATA ---

      toast({ title: "Wallet Data Updated", description: `Balance: ${formattedBalance.toFixed(4)} ASTRO` });
    } catch (err: any) {
      console.error("Error fetching wallet data:", err);
      const displayError = err.reason || err.message || "Failed to fetch wallet data. Ensure you are on the correct network and contract addresses are valid.";
      setError(displayError);
      toast({ title: "Error Fetching Data", description: displayError, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [address, getProvider, toast, getAstroTokenContract, getAstroNftContract]);

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
        await fetchWalletData(newAddress); // Pass newAddress directly
      } else {
        setError("No accounts found. Please ensure your wallet is set up correctly.");
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
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      setAddress(storedAddress);
      // No automatic fetchWalletData here to avoid race conditions with network checks,
      // it will be called on connect or manual refresh.
    }
  }, []);

  // Effect for handling account and chain changes
  useEffect(() => {
    const provider = getProvider();
    if (!provider || !window.ethereum || !window.ethereum.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        const newAddress = accounts[0];
        setAddress(newAddress);
        localStorage.setItem('walletAddress', newAddress);
        fetchWalletData(newAddress); // Pass newAddress
        toast({ title: "Account Changed", description: `Switched to ${newAddress.substring(0,6)}...${newAddress.substring(newAddress.length-4)}` });
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = async (_chainId: string) => {
      toast({ title: "Network Changed", description: "Network has changed. Verifying and reloading data..." });
      // Re-check network and fetch data
      const currentProvider = getProvider(); // Get fresh provider instance
      if (currentProvider) {
          if (await checkNetwork(currentProvider)) {
              const currentSigner = await currentProvider.getSigner();
              if(currentSigner) {
                const currentAddress = await currentSigner.getAddress();
                setAddress(currentAddress); // Ensure address is current
                fetchWalletData(currentAddress);
              } else {
                disconnectWallet(); // If no signer, disconnect
              }
          } else {
            // If checkNetwork fails, it sets error and toasts. Clear local data.
            setAstroBalance(0);
            setNfts([]);
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
      // setError("Please connect your wallet first to check allowance.");
      return false;
    }
    const provider = getProvider();
    if (!provider) {
      // setError("MetaMask not found.");
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
      // toast({ title: "Allowance Check Failed", description: err.message || "Could not check token allowance.", variant: "destructive" });
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
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error("Error approving tokens:", err);
      const displayError = err.reason || err.message || "Failed to approve tokens.";
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
      await fetchWalletData(); // Refresh wallet data
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error("Error minting NFT:", err);
      const displayError = err.reason || err.message || "Failed to mint NFT.";
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

// Helper for IPFS URIs - TODO: Make configurable or more robust
// const ipfsGatewayUrl = (ipfsUri: string) => {
//   if (ipfsUri.startsWith('ipfs://')) {
//     return `https://ipfs.io/ipfs/${ipfsUri.substring(7)}`;
//   }
//   return ipfsUri; 
// };

declare global {
  interface Window {
    ethereum?: any; // Define more specific type if available (e.g., from MetaMask SDK)
  }
}
