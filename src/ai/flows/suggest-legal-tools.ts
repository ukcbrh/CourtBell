'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant legal tools based on case details.
 *
 * - suggestLegalTools - A function that takes case details as input and returns suggested legal tools.
 * - SuggestLegalToolsInput - The input type for the suggestLegalTools function.
 * - SuggestLegalToolsOutput - The return type for the suggestLegalTools function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLegalToolsInputSchema = z.object({
  caseDetails: z
    .string()
    .describe('The details of the case, including type, jurisdiction, and key issues.'),
});

export type SuggestLegalToolsInput = z.infer<typeof SuggestLegalToolsInputSchema>;

const SuggestLegalToolsOutputSchema = z.object({
  suggestedStatutes: z.array(z.string()).describe('A list of suggested statutes relevant to the case.'),
  suggestedCaseLaw: z.array(z.string()).describe('A list of suggested case law relevant to the case.'),
  suggestedTemplates: z.array(z.string()).describe('A list of suggested legal templates relevant to the case.'),
});

export type SuggestLegalToolsOutput = z.infer<typeof SuggestLegalToolsOutputSchema>;

export async function suggestLegalTools(input: SuggestLegalToolsInput): Promise<SuggestLegalToolsOutput> {
  return suggestLegalToolsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLegalToolsPrompt',
  input: {schema: SuggestLegalToolsInputSchema},
  output: {schema: SuggestLegalToolsOutputSchema},
  prompt: `You are an AI legal assistant. Your task is to suggest relevant legal tools (statutes, case law, and templates) based on the details of a case provided by the user.

Case Details: {{{caseDetails}}}

Based on the case details, suggest relevant statutes, case law, and templates. Provide each suggestion in a list.
`,
});

const suggestLegalToolsFlow = ai.defineFlow(
  {
    name: 'suggestLegalToolsFlow',
    inputSchema: SuggestLegalToolsInputSchema,
    outputSchema: SuggestLegalToolsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
