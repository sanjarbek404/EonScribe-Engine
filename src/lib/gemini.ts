import { GoogleGenAI, Type } from "@google/genai";
import { GameState, ImageSize, StoryTurn } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const GAME_MASTER_INSTRUCTION = `
You are an expert Choose-Your-Own-Adventure Game Master. 
Your goal is to narrate an immersive, high-stakes infinite adventure.
Every choice the player makes must genuinely alter the plot. Do not use generic pre-set paths.

When the game starts, define a unique settings (e.g., Cyberpunk, High Fantasy, Eldritch Horror) 
and a consistent Visual Style for images (e.g., 'Oil painting style, moody Lighting, 8k').

For every turn, you MUST return a structured JSON object containing:
1. narrative: A rich, atmospheric description of what happens next (2-4 paragraphs).
2. options: Exactly 3 or 4 meaningful choices for the player.
3. imagePrompt: A detailed prompt for an image generator (gemini-3-pro-image-preview) to visualize the scene. 
   Focus on the character or the environment. Include the Visual Style and character details for consistency.
4. gameState: The updated inventory, current quest, location, character description, and visual style.
   - Inventory should be a simple list of items (e.g., ["Rusty Dagger", "Glowing Key"]).
   - Current Quest should be a short summary (e.g., "Find the hidden sanctuary").
   - Character Description should be fixed once set (e.g., "A tall elf with silver hair and a scarred eye").

RESPONSE FORMAT:
{
  "narrative": string,
  "options": string[],
  "imagePrompt": string,
  "gameState": {
    "inventory": string[],
    "currentQuest": string,
    "location": string,
    "characterDescription": string,
    "visualStyle": string
  }
}

Always maintain internal consistency. If the player gets a "Cursed Amulet", it stays in their inventory until used or lost.
`;

export async function generateNextTurn(
  history: StoryTurn[],
  playerChoice: string | null,
  isInitial: boolean = false
): Promise<StoryTurn> {
  const prompt = isInitial 
    ? "Start a new epic adventure. Define the character, the world, and the initial quest."
    : `The player chosen: "${playerChoice}". Continue the story based on the history and this choice.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      { role: "user", parts: [{ text: history.map(h => `Narrative: ${h.narrative}\nChoice: ${h.options[0]}`).join("\n---\n") + "\n" + prompt }] }
    ],
    config: {
      systemInstruction: GAME_MASTER_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          narrative: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          imagePrompt: { type: Type.STRING },
          gameState: {
            type: Type.OBJECT,
            properties: {
              inventory: { type: Type.ARRAY, items: { type: Type.STRING } },
              currentQuest: { type: Type.STRING },
              location: { type: Type.STRING },
              characterDescription: { type: Type.STRING },
              visualStyle: { type: Type.STRING },
            },
            required: ["inventory", "currentQuest", "location", "characterDescription", "visualStyle"]
          }
        },
        required: ["narrative", "options", "imagePrompt", "gameState"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  return {
    id: crypto.randomUUID(),
    narrative: data.narrative,
    options: data.options,
    imagePrompt: data.imagePrompt,
    gameState: data.gameState,
    timestamp: Date.now()
  };
}

export async function generateImage(prompt: string, size: ImageSize): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: {
      parts: [
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: size
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data found in response");
}
