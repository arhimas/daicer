
import { GoogleGenAI, Type } from "@google/genai";
import type { WorldCondition, TurnUpdate } from '../types';

function getAi() {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set. Please add `API_KEY=your_key_here` to the .env file.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}


export async function generateInitialConditions(): Promise<Omit<WorldCondition, 'lastUpdatedTurn'>[]> {
  const ai = getAi();

  const prompt = `
    As an expert RPG game designer for my project, Daicer, generate a list of 5 to 7 core "World Conditions" to establish the initial state of the game world.

    **Project Context:** Daicer is a D&D 5e-style multiplayer RPG with an AI Dungeon Master.

    **Task:** For each condition:
    - Provide a clear 'key' (e.g., 'RegionalStability').
    - List several possible 'values' it can have.
    - **Important**: Determine if these values are sequential. If they represent a scale (e.g., 'Calm', 'Uneasy', 'Tense'), set an 'ordered' flag to true. Otherwise, set it to false.
    - Assign a starting 'currentValue' from that list.
    - Write a 'description' explaining what this condition represents in the game world.

    Focus on creative, high-fantasy conditions that provide interesting storytelling opportunities.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        worldConditions: {
          type: Type.ARRAY,
          description: "A list of 5-7 initial world conditions.",
          items: {
            type: Type.OBJECT,
            properties: {
                key: { type: Type.STRING },
                values: { type: Type.ARRAY, items: { type: Type.STRING } },
                currentValue: { type: Type.STRING },
                description: { type: Type.STRING },
                ordered: { type: Type.BOOLEAN },
            },
            required: ["key", "values", "currentValue", "description", "ordered"],
          },
        },
      },
      required: ["worldConditions"],
    };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    return parsedResponse.worldConditions.map((c: any) => ({...c, type: 'World Condition'}));

  } catch (error) {
    console.error("Error calling Gemini API for initial conditions:", error);
    if(error instanceof Error && error.message.includes('API_KEY')) {
        throw new Error("Gemini API key is invalid or missing. Please check your .env configuration.");
    }
    throw new Error("Failed to generate initial world conditions. The cosmos is silent.");
  }
}

export async function advanceTurn(currentConditions: WorldCondition[], turn: number, duration: string): Promise<TurnUpdate> {
    const ai = getAi();
    const simpleConditions = currentConditions.map(({ key, currentValue }) => ({ key, currentValue }));

    const prompt = `
        You are the AI Dungeon Master for Daicer, controlling the forces of entropy.
        It is now Turn ${turn}. A time period of **${duration}** has passed.

        The current state of the world is: ${JSON.stringify(simpleConditions, null, 2)}

        Your task is to decide if a change occurs. The **duration** passed directly impacts the probability:
        - A long duration ('1 Week', '1 Day') makes a change **likely**.
        - A medium duration ('8 Hours') makes a change **possible**.
        - A short duration ('1 Hour') makes a change **unlikely, but not impossible**.

        - If NO CHANGE OCCURS, respond with an empty JSON object: {}.
        - If a CHANGE OCCURS, choose ONLY ONE of the following two actions:

        1.  MUTATE A WORLD CONDITION:
            - Pick ONE existing World Condition from the full list provided below.
            - Change its 'currentValue' to a *different* value from its 'values' list.
            - Provide a short, narrative 'reason' for why this change happened.

        2.  TRIGGER A NEW RANDOM EVENT:
            - Create a completely new Random Event.
            - Give it a 'name', a 'description' of what happens, and describe its gameplay 'impact'.

        Your response must be in the specified JSON format. Only return a mutation OR a new event, never both.

        Full World Condition details for reference:
        ${JSON.stringify(currentConditions.map(({type, lastUpdatedTurn, ...rest}) => rest), null, 2)}
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            mutation: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                    key: { type: Type.STRING, description: "The key of the condition to update." },
                    newValue: { type: Type.STRING, description: "The new value for the condition." },
                    reason: { type: Type.STRING, description: "Narrative reason for the change." }
                },
                required: ["key", "newValue", "reason"]
            },
            newEvent: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    impact: { type: Type.STRING }
                },
                required: ["name", "description", "impact"]
            }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.9,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error calling Gemini API for turn advancement:", error);
        if (error instanceof Error && error.message.includes('API_KEY')) {
            throw new Error("Gemini API key is invalid or missing. Please check your .env configuration.");
        }
        throw new Error("The AI failed to process the turn. The threads of fate are tangled.");
    }
}
