
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { AstrophysicalEvent } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, ArrowLeft, CalendarDays, CheckCircle, Coins, Loader2, Sparkles, Tag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MINT_COST = 100; // ASTRO tokens
const ASTRO_NFT_CONTRACT_ADDRESS = "0xNFTAddress"; // TODO: Replace with your Deployed Astro NFT Contract Address (must match WalletContext)


async function fetchEventById(id: string): Promise<AstrophysicalEvent | null> {
  try {
    // For client-side fetching from the public directory, a root-relative path is robust.
    const res = await fetch('/data/events.json');
    if (!res.ok) {
        console.error(`Failed to fetch '/data/events.json': ${res.status} ${res.statusText}`);
        return null;
    }
    const eventsData: AstrophysicalEvent[] = await res.json();
    const event = eventsData.find(e => e.id === id);
    if (!event) {
      // console.warn(`Event with id "${id}" not found in /data/events.json`); // Optional: for debugging missing event
      return null;
    }
    return event;
  } catch (error: any) {
    console.error("Error fetching or parsing event data from /data/events.json:", error.message || error);
    return null;
  }
}

export default function MintEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const router = useRouter();
  const { toast } = useToast();
  const { 
    address, 
    astroBalance, 
    approveAstroTokens, 
    mintAstroNft, 
    loading: walletLoading, 
    connectWallet, 
    fetchWalletData,
    checkAllowance,
    error: walletError,
    targetNetworkName
  } = useWallet();

  const [event, setEvent] = useState<AstrophysicalEvent | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [checkingAllowance, setCheckingAllowance] = useState(false);

  useEffect(() => {
    if (eventId) {
      const loadEvent = async () => {
        setLoadingEvent(true);
        const eventData = await fetchEventById(eventId);
        setEvent(eventData);
        setLoadingEvent(false);
      };
      loadEvent();
    }
  }, [eventId]);

  const updateAllowanceStatus = useCallback(async () => {
    if (address && ASTRO_NFT_CONTRACT_ADDRESS && MINT_COST > 0) {
      setCheckingAllowance(true);
      try {
        const approved = await checkAllowance(ASTRO_NFT_CONTRACT_ADDRESS, MINT_COST);
        setIsApproved(approved);
      } catch (e) {
        console.error("Failed to check allowance:", e);
        setIsApproved(false); // Assume not approved on error
      } finally {
        setCheckingAllowance(false);
      }
    } else {
      setIsApproved(false); // Not connected or no cost, so not "approved" in this context
    }
  }, [address, checkAllowance]); // MINT_COST is a constant, so not needed in deps

  useEffect(() => {
    updateAllowanceStatus();
  }, [address, astroBalance, updateAllowanceStatus]); // Re-check if user, balance, or cost changes


  const handleApprove = async () => {
    if (!event) return;
    const success = await approveAstroTokens(MINT_COST);
    if (success) {
      setIsApproved(true); 
      toast({ title: "Approval Successful", description: `Ready to mint ${event.name} NFT.` });
      await updateAllowanceStatus(); 
    }
  };

  const handleMint = async () => {
    if (!event) return;
    const success = await mintAstroNft(event.metadataUri); 
    if (success) {
      toast({ title: "Mint Successful!", description: `You've minted an NFT for ${event.name}!`, duration: 5000 });
      router.push('/wallet'); 
      if (address) { // Ensure address is still valid before fetching
         await fetchWalletData(address); 
      }
    }
  };

  if (loadingEvent) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-16 w-16 animate-spin text-accent" /><p className="ml-3 text-lg">Loading Event Details...</p></div>;
  }

  if (!event) {
    return <div className="text-center py-12 text-xl text-destructive">Event not found or failed to load. Please check console for errors.</div>;
  }

  const canAfford = astroBalance >= MINT_COST;

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6 text-accent border-accent hover:bg-accent hover:text-accent-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
      </Button>

      {walletError && (
         <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wallet Error</AlertTitle>
            <AlertDescription>
                {walletError}
                {walletError.toLowerCase().includes("network") && 
                    ` Please ensure you are connected to the ${targetNetworkName}.`}
            </AlertDescription>
         </Alert>
      )}

      <Card className="overflow-hidden shadow-2xl bg-card border border-border rounded-xl">
        <div className="grid md:grid-cols-2">
          <div className="relative w-full h-64 md:h-auto min-h-[300px]">
            <Image src={event.image} alt={event.name} layout="fill" objectFit="cover" data-ai-hint={(event['data-ai-hint'] as string) || 'space event'} />
          </div>
          <div className="p-6 md:p-8 flex flex-col">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="font-headline text-3xl md:text-4xl text-accent-foreground">{event.name}</CardTitle>
              {event.simulated && <Badge variant="secondary" className="w-fit mt-1 bg-orange-500/20 text-orange-400 border-orange-500/50">Simulated Event</Badge>}
            </CardHeader>
            <CardContent className="p-0 space-y-3 text-foreground/90 flex-grow">
              <div className="flex items-center text-sm">
                <Tag className="h-4 w-4 mr-2 text-accent" />
                Type: {event.type}
              </div>
              <div className="flex items-center text-sm">
                <CalendarDays className="h-4 w-4 mr-2 text-accent" />
                Date: {format(parseISO(event.date), 'MMMM d, yyyy, HH:mm z')}
              </div>
              <CardDescription className="text-base leading-relaxed">{event.description}</CardDescription>
              {event.coordinates && (
                <p className="text-xs text-muted-foreground">
                  RA: {event.coordinates.ra}, Dec: {event.coordinates.dec}
                  {event.magnitude && ` | Magnitude: ${event.magnitude}`}
                  {event.distance && ` | Distance: ${event.distance}`}
                </p>
              )}
            </CardContent>
            <CardFooter className="p-0 mt-6 pt-6 border-t border-border">
              {!address ? (
                <Button onClick={connectWallet} className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
                  <Sparkles className="mr-2 h-5 w-5" /> Connect Wallet to Mint
                </Button>
              ) : (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <span className="text-lg font-medium text-foreground">Mint Cost:</span>
                    <span className="text-lg font-bold text-accent">{MINT_COST} ASTRO</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <span className="text-sm text-foreground">Your Balance:</span>
                    <span className="text-sm font-semibold text-foreground/90">{astroBalance.toFixed(2)} ASTRO</span>
                  </div>

                  {!canAfford && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Insufficient ASTRO Balance</AlertTitle>
                      <AlertDescription>
                        You need {MINT_COST} ASTRO tokens to mint this NFT. Your current balance is {astroBalance.toFixed(2)} ASTRO.
                      </AlertDescription>
                    </Alert>
                  )}

                  {canAfford && !isApproved && (
                    <Button onClick={handleApprove} disabled={walletLoading || checkingAllowance} className="w-full text-lg py-6 bg-secondary hover:bg-secondary/90">
                      {(walletLoading || checkingAllowance) ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                      Approve {MINT_COST} ASTRO
                    </Button>
                  )}
                  
                  {canAfford && isApproved && (
                    <Button onClick={handleMint} disabled={walletLoading} className="w-full text-lg py-6 bg-accent hover:bg-accent/90">
                      {walletLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                      Mint NFT
                    </Button>
                  )}
                  <Button variant="outline" onClick={async () => { if(address) { await fetchWalletData(address); } await updateAllowanceStatus(); }} disabled={walletLoading || checkingAllowance} className="w-full text-muted-foreground">
                    {(walletLoading || checkingAllowance) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Refresh Data & Allowance
                  </Button>
                </div>
              )}
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}

