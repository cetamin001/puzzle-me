// file: src/ai/flows/hint-generator.ts
'use server';
/**
 * @fileOverview A hint generator for the puzzle game.
 *
 * - generateHint - A function that handles the hint generation process.
 * - HintGeneratorInput - The input type for the generateHint function.
 * - HintGeneratorOutput - The return type for the generateHint function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const HintGeneratorInputSchema = z.object({
  puzzleSolution: z.array(z.number()).describe('The correct solution of the puzzle, represented as an array of numbers.'),
  currentArrangement: z.array(z.number()).describe('The current arrangement of the puzzle pieces, represented as an array of numbers.'),
  selectedPieceIndex: z.number().describe('The index of the selected puzzle piece.'),
});
export type HintGeneratorInput = z.infer<typeof HintGeneratorInputSchema>;

const HintGeneratorOutputSchema = z.object({
  correctPositionIndex: z.number().describe('The index of the correct position for the selected piece.'),
});
export type HintGeneratorOutput = z.infer<typeof HintGeneratorOutputSchema>;

export async function generateHint(input: HintGeneratorInput): Promise<HintGeneratorOutput> {
  return generateHintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hintGeneratorPrompt',
  input: {
    schema: z.object({
      puzzleSolution: z.array(z.number()).describe('The correct solution of the puzzle, represented as an array of numbers.'),
      currentArrangement: z.array(z.number()).describe('The current arrangement of the puzzle pieces, represented as an array of numbers.'),
      selectedPieceIndex: z.number().describe('The index of the selected puzzle piece.'),
    }),
  },
  output: {
    schema: z.object({
      correctPositionIndex: z.number().describe('The index of the correct position for the selected piece.'),
    }),
  },
  prompt: `You are a puzzle solving assistant. A user has selected a puzzle piece at index {{{selectedPieceIndex}}} in their current arrangement:

  {{{currentArrangement}}}

The solution to the puzzle is:

  {{{puzzleSolution}}}

What is the index of where the selected piece *should* be in the solved puzzle? Return ONLY that index.`, // Keep prompt simple
});

const generateHintFlow = ai.defineFlow<
  typeof HintGeneratorInputSchema,
  typeof HintGeneratorOutputSchema
>({
  name: 'generateHintFlow',
  inputSchema: HintGeneratorInputSchema,
  outputSchema: HintGeneratorOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
