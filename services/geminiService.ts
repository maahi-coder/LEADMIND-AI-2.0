import { GoogleGenAI } from "@google/genai";
import type { Lead } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder for environments where the API key might not be set.
  // In a real deployed environment, this should be handled properly.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateLeads = async (
  query: string,
  place: string,
  category: string,
  leadCount: number,
  userLocation: { latitude: number, longitude: number } | null
): Promise<Lead[]> => {

  const leadCountText = leadCount;
  
  const prompt = `
    Act as an expert lead generation specialist.
    Find ${leadCountText} business leads based on the following criteria:
    - Search Query: "${query}"
    - Location: "${place}"
    ${category ? `- Category: "${category}"` : ''}

    For each lead, you MUST provide the following details. If a piece of information is not available, provide "N/A".
    - name: The full business name.
    - address: The complete street address.
    - phone: The main phone number.
    - website: The official website URL, starting with http or https.
    - openingHours: A summary of their opening hours (e.g., "Mon-Fri 9am-5pm").
    - rating: The average user rating as a string (e.g., "4.5").
    - description: A short, compelling sentence describing the best thing about this place.

    Your response MUST be a single, raw JSON object. This object should have a single key named "leads", which contains an array of the lead objects.
    Do NOT include any introductory text, explanations, or markdown formatting like \`\`\`json.
    The response must start with { and end with }.
  `;

  const toolConfig = userLocation ? {
    retrievalConfig: {
      latLng: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      }
    }
  } : undefined;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        toolConfig: toolConfig,
      },
    });
    
    const resultText = response.text.trim();
    
    // Find the start and end of the JSON object to handle conversational text
    const jsonStartIndex = resultText.indexOf('{');
    const jsonEndIndex = resultText.lastIndexOf('}');
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
      const jsonString = resultText.substring(jsonStartIndex, jsonEndIndex + 1);
      try {
        const resultJson = JSON.parse(jsonString);
        if (resultJson.leads && Array.isArray(resultJson.leads)) {
          return resultJson.leads as Lead[];
        } else {
           console.error("Parsed JSON does not contain a 'leads' array:", resultJson);
           throw new Error("Invalid JSON structure from AI service.");
        }
      } catch (e) {
        console.error("Failed to parse extracted JSON:", e);
        console.error("Extracted JSON string:", jsonString);
        throw new Error("Failed to parse JSON from AI response.");
      }
    } else {
        console.error("Could not find a valid JSON object in the AI response.");
        console.error("Full AI response:", resultText);
        throw new Error("Invalid response format from AI service.");
    }

  } catch (error) {
    console.error("Error generating leads from Gemini:", error);
    if (error instanceof Error && (error.message.includes("Invalid response format") || error.message.includes("Failed to parse JSON") || error.message.includes("Invalid JSON structure"))) {
        throw error;
    }
    throw new Error("Failed to fetch leads from AI service.");
  }
};