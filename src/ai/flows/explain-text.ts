// By Mahmoud Muhammad Sani
'use server';

/**
 * @fileOverview Explains a given text in more detail, providing relevant examples to enhance understanding.
 *
 * - explainText - An async function that takes text as input and returns a detailed explanation with examples.
 * - ExplainTextInput - The input type for the explainText function.
 * - ExplainTextOutput - The return type for the explainText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainTextInputSchema = z.object({
  text: z.string().describe('The text to be explained in detail.'),
});
export type ExplainTextInput = z.infer<typeof ExplainTextInputSchema>;

const ExplainTextOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A detailed explanation of the input text with relevant examples.'),
});
export type ExplainTextOutput = z.infer<typeof ExplainTextOutputSchema>;

export async function explainText(input: ExplainTextInput): Promise<ExplainTextOutput> {
  return explainTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainTextPrompt',
  input: {schema: ExplainTextInputSchema},
  output: {schema: ExplainTextOutputSchema},
  prompt: `You are an expert educator, skilled at explaining complex topics in a clear and accessible way.

  Please provide a detailed explanation of the following text, including relevant examples to aid understanding:

  {{text}}`,
});

const explainTextFlow = ai.defineFlow(
  {
    name: 'explainTextFlow',
    inputSchema: ExplainTextInputSchema,
    outputSchema: ExplainTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
