
import { GoogleGenAI, Type } from "@google/genai";
/* Added TerritoryState to imports */
import { GameState, MoveSuggestion, TerritoryState } from "../types";

const STRATEGIST_PROMPT = `You are General Gemini, a grand strategy AI for the Risk board game. 
Analyze the current state and provide tactical assessments.
1. Identify the single most critical territory for the player to focus on (targetTerritoryId).
2. Predict which player-held territory is most at risk of an AI attack (predictedThreatId).
Use the provided territory IDs.`;

export async function getStrategicAdvice(gameState: GameState): Promise<MoveSuggestion> {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  
  /* Fix: Cast Object.values to TerritoryState[] to resolve 'unknown' property access errors */
  const simplifiedState = (Object.values(gameState.territories) as TerritoryState[]).map(t => ({
    id: t.id,
    owner: t.owner,
    troops: t.troops,
    continent: t.continent
  }));

  // Fix: GameState does not have a 'currentPlayer' property.
  // We access the current player ID using 'players' and 'currentPlayerIndex'.
  const currentPlayerId = gameState.players[gameState.currentPlayerIndex].id;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    // Fix: Using the correct currentPlayerId derived above instead of non-existent gameState.currentPlayer.
    contents: `Board: ${JSON.stringify(simplifiedState)}. Player: ${currentPlayerId}. Phase: ${gameState.phase}. Available Reinforcements: ${gameState.reinforcementsAvailable}.`,
    config: {
      systemInstruction: STRATEGIST_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          thoughtProcess: { type: Type.STRING, description: "Internal logic" },
          recommendedAction: { type: Type.STRING, description: "A concise command" },
          targetTerritoryId: { type: Type.STRING, description: "ID to reinforce/attack" },
          predictedThreatId: { type: Type.STRING, description: "ID of player territory the AI will likely hit" },
          confidence: { type: Type.NUMBER, description: "0 to 1 scale" }
        },
        required: ["thoughtProcess", "recommendedAction", "confidence"]
      }
    }
  });

  // Fix: Accessing the .text property (not a method) and handling potentially undefined output before parsing.
  const text = response.text || '{}';
  return JSON.parse(text) as MoveSuggestion;
}
