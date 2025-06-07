
import type { Nft } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, CalendarDays } from 'lucide-react';
import { Button } from './ui/button';
import { format, parseISO } from 'date-fns';

interface NftCardProps {
  nft: Nft;
}

export default function NftCard({ nft }: NftCardProps) {
  const ipfsGatewayUrl = (ipfsUri: string) => {
    // A more robust solution would use a configurable gateway or handle different URI schemes.
    if (ipfsUri.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${ipfsUri.substring(7)}`;
    }
    return ipfsUri; // Fallback if not a standard ipfs:// URI
  };

  return (
    <Card className="w-full max-w-xs bg-card hover:shadow-primary/20 shadow-lg transition-all duration-300 ease-in-out flex flex-col overflow-hidden rounded-xl border border-border">
      <CardHeader className="p-0">
         <div className="relative w-full h-48">
            <Image
                src={nft.image}
                alt={nft.name}
                layout="fill"
                objectFit="cover"
                className="rounded-t-xl"
                data-ai-hint="nft space"
            />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-1 text-primary-foreground">{nft.name}</CardTitle>
        <CardDescription className="text-sm text-foreground/80 line-clamp-2 mb-2">{nft.description}</CardDescription>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Token ID: {nft.id}</p>
          <p className="flex items-center">
            <CalendarDays className="h-3 w-3 mr-1 text-accent" />
            Event: {nft.event.name} ({format(parseISO(nft.event.date), 'MMM d, yyyy')})
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-card/50 border-t border-border">
        <Button variant="outline" size="sm" asChild className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
          <a href={ipfsGatewayUrl(nft.metadataUri)} target="_blank" rel="noopener noreferrer">
            View on IPFS
            <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
