import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

export type GenesisModel = 'gemini-3-flash' | 'gemini-3-pro';

export interface LLMBridgeConfig {
    apiKey?: string;
    temperature?: number;
}

export class LLMBridge {
    private apiKey: string;
    private temperature: number;

    constructor(config?: LLMBridgeConfig) {
        this.apiKey = config?.apiKey || process.env.GEMINI_API_KEY || '';
        this.temperature = config?.temperature ?? 0.7;

        if (!this.apiKey) {
            console.warn('WARN: GEMINI_API_KEY is not set. LLM calls will fail.');
        }
    }

    private resolveModelName(model: GenesisModel): string {
        switch (model) {
            case 'gemini-3-flash':
                return 'gemini-3-flash-preview';
            case 'gemini-3-pro':
                return 'gemini-3.1-pro-preview';
            default:
                return 'gemini-3-flash-preview';
        }
    }

    private getModel(modelName: GenesisModel) {
        return new ChatGoogleGenerativeAI({
            model: this.resolveModelName(modelName),
            apiKey: this.apiKey,
            temperature: this.temperature,
            maxRetries: 3,
        });
    }

    async generateStructured<T>(
        prompt: string,
        schema: z.ZodType<T> | Record<string, any>,
        details: {
            systemInstruction?: string;
            model?: GenesisModel;
            temperature?: number;
        } = {}
    ): Promise<T> {
        const selectedModel = details.model || 'gemini-3-flash';
        const llm = this.getModel(selectedModel);
        
        // Override temperature if specified
        if (details.temperature !== undefined) {
            llm.temperature = details.temperature;
        }

        // LangChain google-genai supports both Zod and JSON Schema objects
        // However, if passed a JSON object, it might expect a different config format depending on version.
        // The current @langchain/google-genai implementation of withStructuredOutput handles Zod nicely.
        // For raw JSON schema, we might need to verify the exact call signature or wrapper.
        // Assuming current version supports standard JSON Schema object as argument.
        
        const llmWithStruct = llm.withStructuredOutput(schema);

        const messages = [];
        if (details.systemInstruction) {
            messages.push(new SystemMessage(details.systemInstruction));
        }
        messages.push(new HumanMessage(prompt));

        let retries = 5;
        let delay = 2000;

        while (retries > 0) {
            try {
                // Add a strict 45-second timeout to prevent the API from hanging indefinitely
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('API Request timed out after 45 seconds')), 45000)
                );
                
                const response = await Promise.race([
                    llmWithStruct.invoke(messages),
                    timeoutPromise
                ]);
                
                return response as T;
            } catch (error: any) {
                retries--;
                if (retries === 0) {
                    throw new Error(`LLM Generation Failed [${selectedModel}]: ${error.message}`);
                }
                console.warn(`⚠️ API Error (${error.message}). Retrying in ${delay / 1000}s... (${retries} attempts left)`);
                await new Promise(res => setTimeout(res, delay));
                delay *= 2; // Exponential backoff
            }
        }
        throw new Error('Unreachable state in LLMBridge retry loop');
    }

    async generateText(
        prompt: string,
        details: { 
            systemInstruction?: string;
            model?: GenesisModel 
        } = {}
    ): Promise<string> {
        const selectedModel = details.model || 'gemini-3-flash';
        const llm = this.getModel(selectedModel);

        const messages = [];
        if (details.systemInstruction) {
            messages.push(new SystemMessage(details.systemInstruction));
        }
        messages.push(new HumanMessage(prompt));

        try {
            const response = await llm.invoke(messages);
            return typeof response.content === 'string' 
                ? response.content 
                : JSON.stringify(response.content);
        } catch (error: any) {
            throw new Error(`LLM Text Generation Failed [${selectedModel}]: ${error.message}`);
        }
    }
}
