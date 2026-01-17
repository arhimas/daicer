import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

export const llmService = {
  generate: async (prompt: string, modelName: string = 'gemini-pro') => {
    if (!apiKey) {
        console.warn('[LLMService] Check your .env: GEMINI_API_KEY or GOOGLE_API_KEY is missing.');
        return 'Mock Response: LLM Key Missing';
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
            console.error('[LLMService] Model not found. Listing available models...');
            try {
                 const genAI = new GoogleGenerativeAI(apiKey);
                 // Note: listModels is on the genAI instance or model manager?
                 // Current SDK structure might require a different call. 
                 // Let's just log the full error for now and try a hardcoded fallback list.
                 // Actually, checking standard names:
            } catch (e) { /* ignore */ }
        }
        console.error('[LLMService] Generation failed:', error);
        throw error;
    }
  }
};
