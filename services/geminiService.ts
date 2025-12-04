
import { GoogleGenAI, Type } from "@google/genai";
import { PackingCategory, PackingItem } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

export const estimateTravelTime = async (
  origin: string,
  destination: string,
  mode: string
): Promise<string> => {
  try {
    const prompt = `
      I need an estimated travel time and distance between two locations.
      Origin: "${origin}"
      Destination: "${destination}"
      Mode: "${mode}"
      
      Please return a very short string describing the estimate, e.g., "15 分鐘 (3.5 公里)" or "1 小時 20 分鐘 (捷運轉乘)".
      If the locations are ambiguous, give a best guess based on popular travel destinations.
      Reply ONLY with the estimate string.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error estimating time:", error);
    return "無法估算";
  }
};

export const generatePackingList = async (
  destination: string,
  days: number,
  type: string
): Promise<PackingCategory[]> => {
  try {
    const prompt = `Generate a travel packing list for a trip to ${destination} for ${days} days. The trip type is ${type}.
    Return a JSON object with a list of 'categories'. Each category should have a 'name' (in Traditional Chinese, e.g., "Clothing", "Electronics", "Baby Supplies") and a list of 'items' (strings in Traditional Chinese).
    Make the categories relevant to the trip type (e.g. if camping, include Camping Gear).
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  items: { 
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text);
    
    if (json.categories && Array.isArray(json.categories)) {
        return json.categories.map((cat: any) => ({
            id: crypto.randomUUID(),
            name: cat.name,
            items: Array.isArray(cat.items) ? cat.items.map((text: string) => ({
                id: crypto.randomUUID(),
                text: text,
                checked: false
            })) : []
        }));
    }
    return [];

  } catch (error) {
    console.error("Error generating packing list:", error);
    return [];
  }
};
