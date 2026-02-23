import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMBridge } from '@/features/genesis-core/llm-bridge';
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

    it('should resolve model names correctly', async () => {
        const mockInvoke = vi.fn().mockResolvedValue({ content: '{"foo":"bar"}' });
        
        // Mock ChatGoogleGenerativeAI constructor
        (ChatGoogleGenerativeAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
            invoke: mockInvoke,
            withStructuredOutput: vi.fn().mockReturnValue({ invoke: mockInvoke })
        }));

        const bridge = new LLMBridge({ apiKey: 'test-key' });
        
        // Test Flash mapping
        await bridge.generateText('hello', { model: 'gemini-3-flash' });
        expect(ChatGoogleGenerativeAI).toHaveBeenCalledWith(expect.objectContaining({
            model: 'gemini-3-flash-preview'
        }));

        // Test Pro mapping
        await bridge.generateText('hello', { model: 'gemini-3-pro' });
        expect(ChatGoogleGenerativeAI).toHaveBeenCalledWith(expect.objectContaining({
            model: 'gemini-3.1-pro-preview'
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

    it('should handle raw JSON schema generation', async () => {
        const jsonSchema = {
            type: 'object',
            properties: {
                name: { type: 'string' }
            }
        };

        const mockResponse = { name: 'Raw' };
        mockInvoke.mockResolvedValue(mockResponse);

        const result = await bridge.generateStructured('Create raw', jsonSchema);
        
        expect(result).toEqual(mockResponse);
        expect(mockWithStructuredOutput).toHaveBeenCalledWith(jsonSchema);
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
