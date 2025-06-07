
"use client";

import { useEffect, useState, useMemo } from 'react';
import type { AstrophysicalEvent } from '@/types';
import EventCard from '@/components/EventCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

async function fetchEvents(): Promise<AstrophysicalEvent[]> {
  try {
    const res = await fetch(`/data/events.json`); // Assumes events.json is in public/data
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

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<AstrophysicalEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AstrophysicalEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [simulationFilter, setSimulationFilter] = useState('all'); // 'all', 'real', 'simulated'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      const eventsData = await fetchEvents();
      setAllEvents(eventsData);
      setFilteredEvents(eventsData);
      setLoading(false);
    };
    loadEvents();
  }, []);

  const eventTypes = useMemo(() => {
    const types = new Set(allEvents.map(event => event.type));
    return ['all', ...Array.from(types)];
  }, [allEvents]);

  useEffect(() => {
    let events = allEvents;

    if (searchTerm) {
      events = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (eventTypeFilter !== 'all') {
      events = events.filter(event => event.type === eventTypeFilter);
    }

    if (simulationFilter !== 'all') {
      events = events.filter(event => simulationFilter === 'real' ? !event.simulated : event.simulated);
    }
    
    // Sort by date, newest first
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredEvents(events);
  }, [searchTerm, eventTypeFilter, simulationFilter, allEvents]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-16 w-16 animate-spin text-accent" />
        <p className="mt-4 text-muted-foreground text-lg">Loading Cosmic Events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card rounded-xl shadow-lg border border-border">
        <h1 className="font-headline text-4xl font-bold mb-4 text-primary-foreground">Event Catalog</h1>
        <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
          Browse through a universe of astrophysical events, both real and simulated. Find your next cosmic collectible.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-card rounded-lg border border-border shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border focus:border-accent"
          />
        </div>
        <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
          <SelectTrigger className="w-full bg-input border-border focus:border-accent">
             <Filter className="inline h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by type..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {eventTypes.map(type => (
              <SelectItem key={type} value={type} className="capitalize focus:bg-accent/50">
                {type === 'all' ? 'All Event Types' : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={simulationFilter} onValueChange={setSimulationFilter}>
          <SelectTrigger className="w-full bg-input border-border focus:border-accent">
            <Filter className="inline h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by reality..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all" className="focus:bg-accent/50">All (Real & Simulated)</SelectItem>
            <SelectItem value="real" className="focus:bg-accent/50">Real Events</SelectItem>
            <SelectItem value="simulated" className="focus:bg-accent/50">Simulated Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No events match your criteria.</p>
          <Button variant="link" onClick={() => { setSearchTerm(''); setEventTypeFilter('all'); setSimulationFilter('all');}} className="text-accent hover:text-accent/80 mt-2">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
