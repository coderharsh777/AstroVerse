
import type { AstrophysicalEvent } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Sparkles, Tag } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface EventCardProps {
  event: AstrophysicalEvent;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Card className="w-full max-w-sm bg-card hover:shadow-accent/20 shadow-lg transition-all duration-300 ease-in-out flex flex-col overflow-hidden rounded-xl border border-border">
      <CardHeader className="p-0">
        <div className="relative w-full h-48">
          <Image
            src={event.image}
            alt={event.name}
            layout="fill"
            objectFit="cover"
            className="rounded-t-xl"
            data-ai-hint={event['data-ai-hint'] as string || "space event"}
          />
          {event.simulated && (
            <Badge variant="destructive" className="absolute top-2 right-2 bg-orange-500 text-white">Simulated</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="font-headline text-2xl mb-2 text-accent-foreground">{event.name}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <Tag className="h-4 w-4 mr-2 text-accent" />
          <span>{event.type}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <CalendarDays className="h-4 w-4 mr-2 text-accent" />
          <span>{format(parseISO(event.date), 'MMMM d, yyyy')}</span>
        </div>
        <CardDescription className="text-foreground/80 line-clamp-3">{event.description}</CardDescription>
        
        {event.coordinates && (
          <div className="mt-3 text-xs text-muted-foreground">
            <MapPin className="inline h-3 w-3 mr-1 text-accent" />
            RA: {event.coordinates.ra}, Dec: {event.coordinates.dec}
            {event.magnitude && ` | Mag: ${event.magnitude}`}
            {event.distance && ` | Dist: ${event.distance}`}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 bg-card/50 border-t border-border">
        <Link href={`/mint/${event.id}`} passHref className="w-full">
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <Sparkles className="mr-2 h-4 w-4" />
            View & Mint NFT
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
