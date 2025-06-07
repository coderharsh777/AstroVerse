
"use client";

import { useEffect, useState } from 'react';
import { suggestInterestingEvents, type SuggestInterestingEventsInput, type SuggestInterestingEventsOutput } from '@/ai/flows/ai-event-suggester';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BrainCircuit, AlertTriangle } from 'lucide-react';
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
    setSuggestedEvents(null); 
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
    } catch (e: any) {
      console.error("Failed to get AI suggestions:", e);
      let errorMessage = "Could not fetch AI suggestions at this time.";
      if (e.message && (e.message.includes("503") || e.message.toLowerCase().includes("overloaded") || e.message.toLowerCase().includes("service unavailable"))) {
        errorMessage = "The AI suggestion service is currently busy. Please try again in a few moments.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, initialEvents]); // Re-fetch if user or initialEvents change

  return (
    <Card className="w-full bg-card shadow-lg my-8 rounded-xl border border-border">
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-2xl text-accent-foreground">
          <BrainCircuit className="mr-2 h-6 w-6 text-accent" />
          AI Event Spotlight
        </CardTitle>
        <CardDescription className="text-foreground/80">
          Personalized event suggestions powered by AstroVerse AI. Data is refreshed periodically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="ml-2 text-muted-foreground">Generating AI suggestions...</p>
          </div>
        )}
        {error && !loading && (
          <div className="text-destructive-foreground bg-destructive/20 p-4 rounded-md border border-destructive my-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p className="font-medium">AI Suggestion Error</p>
            </div>
            <p className="text-sm mt-1">{error}</p>
            <Button onClick={fetchSuggestions} variant="outline" size="sm" className="mt-3 border-destructive text-destructive-foreground hover:bg-destructive/40">
              Try Again
            </Button>
          </div>
        )}
        {suggestedEvents && !loading && !error && (
          <div className="prose prose-invert max-w-none text-foreground/90 bg-muted/30 p-4 rounded-md">
            {/* Assuming suggestedEvents is a string that might need formatting or could be a list */}
            <p>{suggestedEvents}</p>
            {/* You might want to parse suggestedEvents if it's structured JSON or a list */}
          </div>
        )}
         {!loading && !error && !suggestedEvents && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No AI suggestions available at the moment, or still loading initial data.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

