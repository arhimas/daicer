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
                return 'gemini-2.0-flash-exp'; // Provisional 3.0 Flash mapping
            case 'gemini-3-pro':
                return 'gemini-1.5-pro-latest'; // Provisional 3.0 Pro mapping
            default:
                return 'gemini-2.0-flash-exp';
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
        schema: z.ZodType<T>,
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

        const llmWithStruct = llm.withStructuredOutput(schema);

        const messages = [];
        if (details.systemInstruction) {
            messages.push(new SystemMessage(details.systemInstruction));
        }
        messages.push(new HumanMessage(prompt));

        try {
            const response = await llmWithStruct.invoke(messages);
            return response as T;
        } catch (error: any) {
            throw new Error(`LLM Generation Failed [${selectedModel}]: ${error.message}`);
        }
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
