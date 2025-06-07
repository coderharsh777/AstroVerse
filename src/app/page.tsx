
import AiSuggestions from '@/components/AiSuggestions';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import type { AstrophysicalEvent } from '@/types';
import { Award, Telescope, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

async function getEvents(): Promise<AstrophysicalEvent[]> {
  // In a real app, this would be an API call.
  // For now, fetch from public directory.
  // This path is relative to the `public` directory.
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/data/events.json`);
    if (!res.ok) {
      console.error("Failed to fetch events:", res.status, res.statusText);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching events.json:", error);
    return [];
  }
}


export default async function HomePage() {
  const allEvents = await getEvents();
  const featuredEvents = allEvents.filter(event => !event.simulated).slice(0, 3); // Show 3 real events as featured

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative text-center py-16 md:py-24 rounded-xl overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-background shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <Image src="https://placehold.co/1200x600/292A2D/7B62FF.png?text=Cosmic+Background" alt="Cosmic Background" layout="fill" objectFit="cover" data-ai-hint="galaxy stars" />
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-accent-foreground">
            Discover the Universe, Own the Moment.
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
            AstroVerse brings the cosmos to your fingertips. Mint unique NFTs representing real and simulated astrophysical events.
          </p>
          <div className="space-x-4">
            <Link href="/events" passHref>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-lg">
                Explore Events
              </Button>
            </Link>
            <Link href="/#how-it-works" passHref>
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground px-8 py-3 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      {featuredEvents.length > 0 && (
        <section>
          <h2 className="font-headline text-3xl font-bold mb-8 text-center text-primary-foreground">Featured Celestial Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
      
      {/* AI Suggestions Section */}
      <section>
         <AiSuggestions initialEvents={allEvents} />
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-card rounded-xl shadow-lg border border-border">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold mb-12 text-center text-primary-foreground">How AstroVerse Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6">
              <Telescope className="h-16 w-16 mb-4 text-accent" />
              <h3 className="font-headline text-xl font-semibold mb-2 text-accent-foreground">1. Explore Events</h3>
              <p className="text-foreground/80">Discover a catalog of fascinating real and simulated astrophysical phenomena.</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <Award className="h-16 w-16 mb-4 text-accent" />
              <h3 className="font-headline text-xl font-semibold mb-2 text-accent-foreground">2. Mint Your NFT</h3>
              <p className="text-foreground/80">Securely mint a unique NFT for your chosen event using ASTRO tokens.</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <Users className="h-16 w-16 mb-4 text-accent" />
              <h3 className="font-headline text-xl font-semibold mb-2 text-accent-foreground">3. Join the Community</h3>
              <p className="text-foreground/80">Connect with fellow space enthusiasts and NFT collectors in the AstroVerse.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-12">
         <h2 className="font-headline text-3xl font-bold mb-6 text-primary-foreground">Ready to Start Your Cosmic Journey?</h2>
         <Link href="/events" passHref>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-4 text-xl">
              View All Events & Mint Now
            </Button>
          </Link>
      </section>
    </div>
  );
}
