"use server";

import { extractTextFromImage as extractTextFromImageFlow, ExtractTextFromImageInput, ExtractTextFromImageOutput } from '@/ai/flows/extract-text-from-image';
import { summarizeText as summarizeTextFlow, SummarizeTextInput, SummarizeTextOutput } from '@/ai/flows/summarize-text';
import { explainText as explainTextFlow, ExplainTextInput, ExplainTextOutput } from '@/ai/flows/explain-text';

export async function extractTextFromImageAction(input: ExtractTextFromImageInput): Promise<ExtractTextFromImageOutput | { error: string }> {
  try {
    console.log("Extracting text from image with data URI length:", input.photoDataUri.length);
    const result = await extractTextFromImageFlow(input);
    console.log("Extraction successful:", result);
    return result;
  } catch (error) {
    console.error("Error in extractTextFromImageAction:", error);
    return { error: error instanceof Error ? error.message : "An unknown error occurred during text extraction." };
  }
}

export async function summarizeTextAction(input: SummarizeTextInput): Promise<SummarizeTextOutput | { error: string }> {
  try {
    const result = await summarizeTextFlow(input);
    return result;
  } catch (error) {
    console.error("Error in summarizeTextAction:", error);
    return { error: error instanceof Error ? error.message : "An unknown error occurred during text summarization." };
  }
}

export async function explainTextAction(input: ExplainTextInput): Promise<ExplainTextOutput | { error: string }> {
  try {
    const result = await explainTextFlow(input);
    return result;
  } catch (error) {
    console.error("Error in explainTextAction:", error);
    return { error: error instanceof Error ? error.message : "An unknown error occurred during text explanation." };
  }
}
