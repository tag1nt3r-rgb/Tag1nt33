import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGameLevel = async (): Promise<GeminiResponse> => {
  // We need a 3x7 grid where:
  // 1. Each row is a permutation of 1-7.
  // 2. The columns are the triplets of a Fano plane (Steiner Triple System of order 7).
  //    This satisfies the rule: "Each image can be placed with the same image in a column only once" (pair uniqueness).
  //    If strict Fano plane mapping to permutations is impossible, we ensure minimal collision.
  
  const prompt = `
    Generate a JSON solution for a puzzle game with a 7 columns x 3 rows grid using numbers 1 to 7.
    Strict Rules:
    1. Each row must contain numbers 1, 2, 3, 4, 5, 6, 7 exactly once (permutation).
    2. Each column must contain 3 DIFFERENT numbers.
    3. The columns, as sets of 3 numbers, should follow the structure of a Fano Plane (Steiner Triple System S(2,3,7)).
       This means every pair of numbers {x,y} from 1-7 appears together in exactly one column.
    
    Output format:
    A single JSON object with a "grid" property which is an array of 3 arrays (rows).
    Example: { "grid": [[1,2...], [3,4...], ...] }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grid: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
              },
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text) as GeminiResponse;
    return data;
  } catch (error) {
    console.error("Failed to generate level:", error);
    // Fallback static valid grid if AI fails (Approximate Fano-like valid Latin Rectangle)
    return {
      grid: [
        [1, 2, 3, 4, 5, 6, 7],
        [2, 3, 4, 5, 6, 7, 1],
        [4, 5, 6, 7, 1, 2, 3]
      ]
    };
  }
};
