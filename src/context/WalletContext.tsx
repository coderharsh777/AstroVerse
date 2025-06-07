
"use client";

import type { Nft, WalletState } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

// Mock ABIs and Addresses - replace with actual ones
const ASTRO_TOKEN_ADDRESS = "0xTokenAddress"; // Placeholder
const ASTRO_NFT_ADDRESS = "0xNFTAddress"; // Placeholder
const ASTRO_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint250)"
];
const ASTRO_NFT_ABI = [
  "function mintNFT(string memory tokenURI) public",
  "function walletOfOwner(address _owner) public view returns (uint256[] memory)"
  // Add more NFT functions as needed, like tokenURI(uint256 tokenId)
];


interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  approveAstroTokens: (amount: number) => Promise<boolean>;
  mintAstroNft: (metadataUri: string) => Promise<boolean>;
  fetchWalletData: () => Promise<void>;
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
    if (provider) {
      return provider.getSigner();
    }
    return null;
  }, [getProvider]);

  const fetchWalletData = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const provider = getProvider();
      if (!provider) {
        setError("MetaMask not found.");
        setLoading(false);
        return;
      }
      
      // Fetch ASTRO balance
      const tokenContract = new ethers.Contract(ASTRO_TOKEN_ADDRESS, ASTRO_TOKEN_ABI, provider);
      const balance = await tokenContract.balanceOf(address);
      setAstroBalance(parseFloat(ethers.formatEther(balance)));

      // Fetch NFTs (mocked for now as it needs full metadata resolution)
      // const nftContract = new ethers.Contract(ASTRO_NFT_ADDRESS, ASTRO_NFT_ABI, provider);
      // const ownedTokenIds = await nftContract.walletOfOwner(address);
      // const fetchedNfts: Nft[] = await Promise.all(
      //   ownedTokenIds.map(async (tokenId: ethers.BigNumberish) => {
      //     // In a real app, fetch metadata from IPFS using tokenURI
      //     return {
      //       id: tokenId.toString(),
      //       name: `Astro NFT #${tokenId.toString()}`,
      //       description: "An amazing astrophysical event NFT.",
      //       image: `https://placehold.co/300x300/242959/FFFFFF.png?text=NFT+${tokenId.toString()}`,
      //       event: { id: "mockEvent", name: "Mock Event", date: new Date().toISOString() },
      //       metadataUri: `ipfs://mockhash/${tokenId.toString()}`
      //     };
      //   })
      // );
      // setNfts(fetchedNfts);
      setNfts([
        { id: "1", name: "Supernova Spectacle", description: "Witness the birth of new elements.", image: "https://placehold.co/300x300/242959/FFFFFF.png?text=NFT+1", event: {id: "sn1987a", name: "Supernova 1987A", date: "1987-02-23T07:35:00Z"}, metadataUri: "ipfs://Qm..."},
        { id: "2", name: "Eclipse Elegance", description: "A dance of celestial bodies.", image: "https://placehold.co/300x300/7B62FF/FFFFFF.png?text=NFT+2", event: {id: "eclipse2024", name: "Total Solar Eclipse 2024", date: "2024-04-08T18:17:00Z"}, metadataUri: "ipfs://Qm..."},
      ]);


      toast({ title: "Wallet Data Updated", description: `Balance: ${ethers.formatEther(balance)} ASTRO` });
    } catch (err: any) {
      console.error("Error fetching wallet data:", err);
      setError(err.message || "Failed to fetch wallet data.");
      toast({ title: "Error", description: "Failed to fetch wallet data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [address, getProvider, toast]);


  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    const provider = getProvider();
    if (!provider) {
      setError("MetaMask is not installed. Please install it to continue.");
      toast({ title: "MetaMask Not Found", description: "Please install MetaMask.", variant: "destructive" });
      setLoading(false);
      return;
    }
    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);
        toast({ title: "Wallet Connected", description: `Connected to ${accounts[0].substring(0,6)}...${accounts[0].substring(accounts[0].length-4)}` });
        await fetchWalletData();
      }
    } catch (err: any) {
      console.error("Failed to connect wallet:", err);
      setError(err.message || "Failed to connect wallet.");
      toast({ title: "Connection Failed", description: err.message || "Could not connect wallet.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setAstroBalance(0);
    setNfts([]);
    localStorage.removeItem('walletAddress');
    toast({ title: "Wallet Disconnected" });
  };
  
  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      setAddress(storedAddress);
    }
  }, []);

  useEffect(() => {
    if (address) {
      fetchWalletData();
    }
     if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          fetchWalletData();
        } else {
          disconnectWallet();
        }
      });
      window.ethereum.on('chainChanged', () => {
        // Handle chain change, e.g., reload data or prompt user
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [address, fetchWalletData]);


  const approveAstroTokens = async (amount: number): Promise<boolean> => {
    if (!address) {
      toast({ title: "Error", description: "Please connect your wallet first.", variant: "destructive" });
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Signer not available.");
      
      const tokenContract = new ethers.Contract(ASTRO_TOKEN_ADDRESS, ASTRO_TOKEN_ABI, signer);
      const amountToApprove = ethers.parseEther(amount.toString());
      
      toast({ title: "Approval Pending", description: "Please approve the token spending in MetaMask." });
      const tx = await tokenContract.approve(ASTRO_NFT_ADDRESS, amountToApprove);
      await tx.wait();
      
      toast({ title: "Approval Successful", description: `${amount} ASTRO tokens approved.` });
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error("Error approving tokens:", err);
      setError(err.message || "Failed to approve tokens.");
      toast({ title: "Approval Failed", description: err.message || "Could not approve tokens.", variant: "destructive" });
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
    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Signer not available.");

      const nftContract = new ethers.Contract(ASTRO_NFT_ADDRESS, ASTRO_NFT_ABI, signer);
      
      toast({ title: "Minting Pending", description: "Please confirm the minting transaction in MetaMask." });
      const tx = await nftContract.mintNFT(metadataUri);
      await tx.wait();
      
      toast({ title: "NFT Minted!", description: "Your new AstroVerse NFT has been minted." });
      await fetchWalletData(); // Refresh wallet data
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error("Error minting NFT:", err);
      setError(err.message || "Failed to mint NFT.");
      toast({ title: "Minting Failed", description: err.message || "Could not mint NFT.", variant: "destructive" });
      setLoading(false);
      return false;
    }
  };


  return (
    <WalletContext.Provider value={{ address, astroBalance, nfts, loading, error, connectWallet, disconnectWallet, approveAstroTokens, mintAstroNft, fetchWalletData }}>
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
