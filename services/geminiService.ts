import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL_TEXT_EXTRACT, GEMINI_SYSTEM_INSTRUCTION_EXTRACT } from '../constants';
import { ExtractedItemName } from '../types';

/**
 * Service to interact with the Google Gemini API.
 * Assumes process.env.API_KEY is available for API authorization.
 */
class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // Initialize GoogleGenAI only if API_KEY is available.
    // In a real application, you might handle missing API_KEY more explicitly.
    if (process.env.API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
      console.error("GeminiService: API_KEY is not defined. Gemini features will be unavailable.");
    }
  }

  /**
   * Extracts an item name from a given text query using the Gemini model.
   * @param query The user's natural language query (e.g., "Where is my charger?").
   * @returns A promise that resolves to the extracted item name string, or null if extraction fails.
   */
  public async extractItemName(query: string): Promise<string | null> {
    if (!this.ai) {
      console.error("GeminiService: Gemini API client not initialized.");
      return null;
    }

    try {
      // Call the Gemini model to generate content with a specific system instruction
      // and a response schema to ensure structured JSON output.
      const response = await this.ai.models.generateContent({
        model: GEMINI_MODEL_TEXT_EXTRACT,
        contents: [{ parts: [{ text: query }] }],
        config: {
          systemInstruction: GEMINI_SYSTEM_INSTRUCTION_EXTRACT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              itemName: {
                type: Type.STRING,
                description: 'The extracted item name from the user query.',
              },
            },
            required: ['itemName'],
          },
        },
      });

      // Extract the text response from Gemini and attempt to parse it as JSON.
      const jsonStr = response.text?.trim();
      if (!jsonStr) {
        console.warn("GeminiService: No text response from Gemini for query:", query);
        return null;
      }

      const parsedResponse: ExtractedItemName = JSON.parse(jsonStr);
      return parsedResponse.itemName;

    } catch (error) {
      console.error("GeminiService: Error extracting item name for query:", query, error);
      // More robust error handling could involve retries or different models.
      return null;
    }
  }
}

// Export a singleton instance of the GeminiService.
export const geminiService = new GeminiService();
