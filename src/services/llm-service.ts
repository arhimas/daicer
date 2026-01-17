import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// User specified model for 2026 context
const FALLBACK_MODELS = ['gemini-3-flash-preview', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'];

export const llmService = {
  generate: async (prompt: string, modelName: string = 'gemini-3-flash-preview') => {
    if (!apiKey) {
        console.warn('[LLMService] Check your .env: GEMINI_API_KEY or GOOGLE_API_KEY is missing.');
        return 'Mock Response: LLM Key Missing';
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Construct list starting with requested model, then fallbacks (deduplicated)
    const modelsToTry = Array.from(new Set([modelName, ...FALLBACK_MODELS]));

    for (const model of modelsToTry) {
        try {
            console.log(`[LLMService] Attempting generation with model: ${model}...`);
            const aiModel = genAI.getGenerativeModel({ model: model });
            const result = await aiModel.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
             console.warn(`[LLMService] Failed with ${model}: ${error.message}`);
             if (model === modelsToTry[modelsToTry.length - 1]) {
                 // Last one failed
                 throw error;
             }
        }
    }
    throw new Error('All models failed.');
  }
};
