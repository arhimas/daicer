"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const gemini_service_1 = __importDefault(require("../gemini-service"));
// Mock LangChain
const { mockInvoke, mockWithStructuredOutput, mockChatGoogleGenerativeAI } = vitest_1.vi.hoisted(() => {
    const mockInvoke = vitest_1.vi.fn();
    const mockWithStructuredOutput = vitest_1.vi.fn().mockReturnValue({ invoke: mockInvoke });
    const mockChatGoogleGenerativeAI = vitest_1.vi.fn(function () {
        return { withStructuredOutput: mockWithStructuredOutput };
    });
    return { mockInvoke, mockWithStructuredOutput, mockChatGoogleGenerativeAI };
});
vitest_1.vi.mock('@langchain/google-genai', () => ({
    ChatGoogleGenerativeAI: mockChatGoogleGenerativeAI
}));
(0, vitest_1.describe)('GeminiService', () => {
    let service;
    // Mock Strapi DB for Prompts
    const mockFindOne = vitest_1.vi.fn();
    const mockStrapi = {
        log: { error: vitest_1.vi.fn(), info: vitest_1.vi.fn(), warn: vitest_1.vi.fn() },
        db: {
            query: vitest_1.vi.fn().mockReturnValue({
                findOne: mockFindOne
            })
        }
    };
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        process.env.GEMINI_API_KEY = 'test-key';
        service = (0, gemini_service_1.default)({ strapi: mockStrapi });
        // Default Prompt Mock
        mockFindOne.mockResolvedValue({
            key: 'test-prompt',
            text: 'System Prompt: {{width}}x{{height}} {{specificInstruction}}'
        });
    });
    (0, vitest_1.describe)('generatePixelData', () => {
        (0, vitest_1.it)('should call LangChain and return processed data', async () => {
            // Mock Response from LangChain
            mockInvoke.mockResolvedValueOnce({
                pixelData: Array(32).fill(Array(32).fill('#FF0000'))
            });
            const config = {
                prompt: 'Test Dragon',
                type: 'Monster',
                archetype: 'Dragon',
                blueprint: [],
                model: 'gemini-3-flash-preview',
                width: 32,
                height: 32
            };
            // @ts-expect-error - Mock config
            const result = await service.generatePixelData(config);
            (0, vitest_1.expect)(mockChatGoogleGenerativeAI).toHaveBeenCalled();
            (0, vitest_1.expect)(mockWithStructuredOutput).toHaveBeenCalled();
            (0, vitest_1.expect)(mockInvoke).toHaveBeenCalled();
            (0, vitest_1.expect)(result.pixelData.length).toBe(32);
            (0, vitest_1.expect)(result.pixelData[0][0]).toBe('#FF0000');
        });
        (0, vitest_1.it)('should throw error if API key missing', async () => {
            delete process.env.GEMINI_API_KEY;
            const config = { prompt: 'Test', type: 'Monster', archetype: 'Humanoid', blueprint: [] };
            // @ts-expect-error - Mock config
            await (0, vitest_1.expect)(service.generatePixelData(config)).rejects.toThrow('GEMINI_API_KEY not configured');
        });
        (0, vitest_1.it)('should fail if Prompt Template is missing', async () => {
            mockFindOne.mockResolvedValueOnce(null); // Simulate missing prompt
            const config = {
                prompt: 'Test',
                type: 'Monster',
                archetype: 'Humanoid',
                blueprint: []
            };
            // @ts-expect-error - Mock config
            await (0, vitest_1.expect)(service.generatePixelData(config)).rejects.toThrow();
        });
    });
    (0, vitest_1.it)('should generate vision payload with PNG data when blueprints provided', async () => {
        mockInvoke.mockResolvedValueOnce({
            pixelData: Array(32).fill(Array(32).fill('#00FF00'))
        });
        const config = {
            prompt: 'Vision Test',
            type: 'Monster',
            archetype: 'Humanoid',
            blueprint: [['#FFFFFF', '#FFFF00'], ['#0000FF', 'transparent']],
            width: 32,
            height: 32
        };
        // @ts-expect-error - Mock config
        await service.generatePixelData(config);
        (0, vitest_1.expect)(mockInvoke).toHaveBeenCalled();
        const args = mockInvoke.mock.calls[0];
        // Args: [SystemMessage, HumanMessage] or just Prompt value depending on invoke signature
        // The service passes [SystemMessage, HumanMessage] array
        const messages = args[0];
        const humanMsg = messages.find((m) => m.content && Array.isArray(m.content));
        (0, vitest_1.expect)(humanMsg).toBeDefined();
        const imagePart = humanMsg.content.find((p) => p.type === 'image_url');
        (0, vitest_1.expect)(imagePart).toBeDefined();
        (0, vitest_1.expect)(imagePart.image_url).toContain('data:image/png;base64,');
    });
    (0, vitest_1.describe)('generateBlueprint', () => {
        (0, vitest_1.it)('should return unique zones used in the grid', async () => {
            // Mock successful prompt fetch
            mockFindOne.mockResolvedValue({
                key: 'blueprint-architect',
                text: 'System Prompt'
            });
            // Mock LangChain response with a grid using explicit symbols
            mockInvoke.mockResolvedValueOnce({
                blueprint: [
                    '..XX..', // . = none, X = weapon (implicit/fallback mapping)
                    '..OO..', // O = head (implicit/fallback)
                ]
            });
            // Mock DB Zones (using the mock object passed to factory)
            const mockFindMany = vitest_1.vi.fn().mockResolvedValue([
                { name: 'Weapon', slug: 'weapon', color: '#FF0000', symbol: 'X' },
                { name: 'Head', slug: 'head', color: '#FFFF00', symbol: 'O' }
            ]);
            // Update query mock to return findMany as well
            mockStrapi.db.query.mockReturnValue({
                findOne: mockFindOne,
                findMany: mockFindMany
            });
            const config = {
                prompt: 'Test Sword',
                type: 'Blueprint',
                archetype: 'Item',
                blueprint: [],
                width: 6,
                height: 2
            };
            // @ts-expect-error - Mock config
            const result = await service.generateBlueprint(config);
            (0, vitest_1.expect)(result.zones).toBeDefined();
            (0, vitest_1.expect)(result.zones).toContain('weapon');
            (0, vitest_1.expect)(result.zones).toContain('head');
            (0, vitest_1.expect)(result.zones.length).toBe(2);
        });
    });
    (0, vitest_1.describe)('validateAndRepairGrid', () => {
        (0, vitest_1.it)('should return empty 32x32 if input is invalid', () => {
            const result = service.validateAndRepairGrid(null);
            (0, vitest_1.expect)(result.length).toBe(32);
            (0, vitest_1.expect)(result[0].length).toBe(32);
            (0, vitest_1.expect)(result[0][0]).toBe('transparent');
        });
        // Flattened array test removed as strict 2D is enforced
        (0, vitest_1.it)('should handle invalid rows gracefully', () => {
            const invalid = ['not-an-array'];
            const result = service.validateAndRepairGrid(invalid);
            (0, vitest_1.expect)(result[0][0]).toBe('transparent');
        });
        (0, vitest_1.it)('should truncate oversized grids', () => {
            const bigGrid = Array(40).fill(Array(40).fill('#000'));
            const result = service.validateAndRepairGrid(bigGrid);
            (0, vitest_1.expect)(result.length).toBe(32);
            (0, vitest_1.expect)(result[0].length).toBe(32);
        });
    });
});
