import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMBridge } from '../llm-bridge';
import { z } from 'zod';

// Mock @langchain/google-genai
const mockInvoke = vi.fn();
const mockWithStructuredOutput = vi.fn();

vi.mock('@langchain/google-genai', () => {
    return {
        ChatGoogleGenerativeAI: vi.fn().mockImplementation(function() {
            return {
                invoke: mockInvoke,
                withStructuredOutput: mockWithStructuredOutput,
                temperature: 0.7
            };
        })
    };
});

describe('LLMBridge', () => {
    let bridge: LLMBridge;

    beforeEach(() => {
        process.env.GEMINI_API_KEY = 'test-key';
        bridge = new LLMBridge();
        vi.clearAllMocks();
        
        // Setup default mocks
        mockWithStructuredOutput.mockReturnValue({
            invoke: mockInvoke
        });
    });

    it('should initialize with default config', () => {
        expect(bridge).toBeDefined();
    });

    it('should resolve correct model names', async () => {
        // Can't easily test private method, but we can verify what was passed to constructor via mock?
        // Actually we can check behavior by calling generateText
        
        mockInvoke.mockResolvedValue({ content: 'test response' });
        
        await bridge.generateText('hello', { model: 'gemini-3-flash' });
        
        const { ChatGoogleGenerativeAI } = await import('@langchain/google-genai');
        expect(ChatGoogleGenerativeAI).toHaveBeenCalledWith(expect.objectContaining({
            model: 'gemini-2.0-flash-exp'
        }));

        await bridge.generateText('hello', { model: 'gemini-3-pro' });
        expect(ChatGoogleGenerativeAI).toHaveBeenCalledWith(expect.objectContaining({
            model: 'gemini-1.5-pro-latest'
        }));
    });

    it('should handle text generation', async () => {
        mockInvoke.mockResolvedValue({ content: 'Hello World' });

        const result = await bridge.generateText('Hi');
        
        expect(result).toBe('Hello World');
        expect(mockInvoke).toHaveBeenCalled();
    });

    it('should handle structured generation', async () => {
        const schema = z.object({
            name: z.string(),
            age: z.number()
        });

        const mockResponse = { name: 'John', age: 30 };
        mockInvoke.mockResolvedValue(mockResponse); // invoke on the structured chain returns the object directly usually

        const result = await bridge.generateStructured('Create user', schema);

        expect(result).toEqual(mockResponse);
        expect(mockWithStructuredOutput).toHaveBeenCalledWith(schema);
    });

    it('should pass system instruction', async () => {
        mockInvoke.mockResolvedValue({ content: 'ok' });
        
        await bridge.generateText('user', { systemInstruction: 'system' });
        
        // Check calls to invoke
        const calls = mockInvoke.mock.calls[0];
        const messages = calls[0]; // first arg is messages array
        expect(messages).toHaveLength(2);
        expect(messages[0].constructor.name).toBe('SystemMessage');
        expect(messages[1].constructor.name).toBe('HumanMessage');
    });

    it('should handle errors', async () => {
         mockInvoke.mockRejectedValue(new Error('API Error'));
         
         await expect(bridge.generateText('fail')).rejects.toThrow('LLM Text Generation Failed');
    });
});
