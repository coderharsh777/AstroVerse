// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI agent for suggesting interesting astrophysical events based on user profile and past activity.
 *
 * - suggestInterestingEvents - A function that suggests relevant or interesting real-time event data.
 * - SuggestInterestingEventsInput - The input type for the suggestInterestingEvents function.
 * - SuggestInterestingEventsOutput - The return type for the suggestInterestingEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInterestingEventsInputSchema = z.object({
  userProfile: z
    .string()
    .describe('The user profile including preferences and past activity.'),
  eventData: z.string().describe('Real-time astrophysical event data.'),
});
export type SuggestInterestingEventsInput = z.infer<
  typeof SuggestInterestingEventsInputSchema
>;

const SuggestInterestingEventsOutputSchema = z.object({
  suggestedEvents: z
    .string()
    .describe('A list of suggested events based on the user profile.'),
});
export type SuggestInterestingEventsOutput = z.infer<
  typeof SuggestInterestingEventsOutputSchema
>;

export async function suggestInterestingEvents(
  input: SuggestInterestingEventsInput
): Promise<SuggestInterestingEventsOutput> {
  return suggestInterestingEventsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInterestingEventsPrompt',
  input: {schema: SuggestInterestingEventsInputSchema},
  output: {schema: SuggestInterestingEventsOutputSchema},
  prompt: `You are an expert in suggesting interesting astrophysical events to users based on their profile and past activity.

  Given the following user profile and real-time event data, suggest the most relevant events to the user.

  User Profile: {{{userProfile}}}
  Event Data: {{{eventData}}}

  Suggest events that are most likely to be of interest to the user.
  Return a list of suggested events.`,
});

const suggestInterestingEventsFlow = ai.defineFlow(
  {
    name: 'suggestInterestingEventsFlow',
    inputSchema: SuggestInterestingEventsInputSchema,
    outputSchema: SuggestInterestingEventsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
