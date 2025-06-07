
"use client";

import { useWallet } from '@/context/WalletContext';
import NftCard from '@/components/NftCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Layers, Loader2, WalletIcon, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function WalletPage() {
  const { address, astroBalance, nfts, loading, error, connectWallet, fetchWalletData } = useWallet();

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <WalletIcon className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="font-headline text-3xl font-bold mb-4 text-primary-foreground">Connect Your Wallet</h1>
        <p className="text-lg text-foreground/80 mb-8 max-w-md">
          To view your AstroVerse NFTs and ASTRO token balance, please connect your MetaMask wallet.
        </p>
        <Button onClick={connectWallet} disabled={loading} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <WalletIcon className="mr-2 h-5 w-5" />}
          Connect Wallet
        </Button>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card rounded-xl shadow-lg border border-border">
        <h1 className="font-headline text-4xl font-bold mb-2 text-primary-foreground">My Cosmic Portfolio</h1>
        <p className="text-sm text-muted-foreground truncate px-4">Wallet: {address}</p>
      </section>

      {error && (
        <div className="p-4 bg-destructive/20 text-destructive-foreground rounded-md border border-destructive">
          <p>Error loading wallet data: {error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card shadow-md border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-accent-foreground">ASTRO Token Balance</CardTitle>
            <Coins className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-foreground">
              {loading && !astroBalance ? <Loader2 className="h-8 w-8 animate-spin" /> : `${astroBalance.toFixed(4)} ASTRO`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your current balance of AstroVerse utility tokens.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-md border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-accent-foreground">NFT Collection Size</CardTitle>
            <Layers className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-foreground">
               {loading && nfts.length === 0 ? <Loader2 className="h-8 w-8 animate-spin" /> : nfts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total unique astrophysical event NFTs you own.
            </p>
          </CardContent>
        </Card>
      </div>
       <Button onClick={fetchWalletData} disabled={loading} variant="outline" className="text-accent border-accent hover:bg-accent hover:text-accent-foreground">
        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh Data
      </Button>


      <section>
        <h2 className="font-headline text-3xl font-bold mb-6 text-primary-foreground">Your NFT Collection</h2>
        {loading && nfts.length === 0 ? (
           <div className="flex items-center justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="ml-3 text-muted-foreground">Loading your NFTs...</p>
          </div>
        ) : nfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <NftCard key={nft.id} nft={nft} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg border border-border shadow-sm">
            <Layers className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-2">Your NFT collection is empty.</p>
            <p className="text-foreground/80 mb-6">Explore events and mint your first AstroVerse NFT!</p>
            <Link href="/events" passHref>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Discover Events
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
