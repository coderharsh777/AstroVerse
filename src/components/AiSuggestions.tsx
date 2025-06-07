
"use client";

import { useEffect, useState } from 'react';
import { suggestInterestingEvents, type SuggestInterestingEventsInput, type SuggestInterestingEventsOutput } from '@/ai/flows/ai-event-suggester';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BrainCircuit } from 'lucide-react';
import type { AstrophysicalEvent, UserProfileForAI } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface AiSuggestionsProps {
  initialEvents: AstrophysicalEvent[]; // All available events to feed to AI
}

export default function AiSuggestions({ initialEvents }: AiSuggestionsProps) {
  const [suggestedEvents, setSuggestedEvents] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Get user profile if available

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Construct user profile for AI. This is a simplified example.
      const userProfileForAI: UserProfileForAI = {
        preferences: user ? ["astronomy enthusiast", "NFT collector"] : ["general interest"],
        pastActivity: user ? ["logged in", "viewed homepage"] : ["new user"],
      };
      
      const eventDataString = initialEvents.map(e => `${e.name} (${e.type}, ${e.date})`).join('; ');

      const input: SuggestInterestingEventsInput = {
        userProfile: `Preferences: ${userProfileForAI.preferences.join(', ')}; Past Activity: ${userProfileForAI.pastActivity.join(', ')}`,
        eventData: `Available events: ${eventDataString}`,
      };
      
      const result: SuggestInterestingEventsOutput = await suggestInterestingEvents(input);
      setSuggestedEvents(result.suggestedEvents);
    } catch (e) {
      console.error("Failed to get AI suggestions:", e);
      setError("Could not fetch AI suggestions at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Refetch if user logs in/out

  return (
    <Card className="w-full bg-card shadow-lg my-8 rounded-xl border border-border">
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-2xl text-accent-foreground">
          <BrainCircuit className="mr-2 h-6 w-6 text-accent" />
          AI Event Spotlight
        </CardTitle>
        <CardDescription className="text-foreground/80">
          Personalized event suggestions powered by AstroVerse AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="ml-2 text-muted-foreground">Thinking...</p>
          </div>
        )}
        {error && (
          <div className="text-destructive py-4">
            <p>{error}</p>
            <Button onClick={fetchSuggestions} variant="outline" size="sm" className="mt-2">Try Again</Button>
          </div>
        )}
        {suggestedEvents && !loading && (
          <div className="prose prose-invert max-w-none text-foreground/90">
            {/* Assuming suggestedEvents is a string that might need formatting or could be a list */}
            <p>{suggestedEvents}</p>
            {/* You might want to parse suggestedEvents if it's structured JSON or a list */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
