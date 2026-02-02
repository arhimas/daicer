"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const gemini_service_1 = __importDefault(require("../gemini-service"));
// Mock LangChain
const { mockInvoke, mockChatGoogleGenerativeAI } = vitest_1.vi.hoisted(() => {
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
(0, vitest_1.describe)('GeminiService Verification (Strict & SOTA)', () => {
    let service;
    // Mock Strapi
    const mockFindOne = vitest_1.vi.fn();
    const mockFindMany = vitest_1.vi.fn();
    const mockDocFindOne = vitest_1.vi.fn();
    // Schema Introspection Mocks
    const mockGetModel = vitest_1.vi.fn();
    // Context Service Mock
    const mockFetchDeepContext = vitest_1.vi.fn();
    const mockStrapi = {
        log: { error: vitest_1.vi.fn(), info: vitest_1.vi.fn(), warn: vitest_1.vi.fn() },
        db: {
            query: (_uid) => ({
                findOne: mockFindOne,
                findMany: mockFindMany
            })
        },
        documents: (_uid) => ({
            findOne: mockDocFindOne
        }),
        getModel: mockGetModel,
        plugin: (_name) => ({
            service: (_name) => ({
                fetchDeepContext: mockFetchDeepContext
            })
        })
    };
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        process.env.GEMINI_API_KEY = 'verification-key';
        service = (0, gemini_service_1.default)({ strapi: mockStrapi });
        // Default Prompt Templates - Use single braces for LangChain
        mockFindOne.mockResolvedValue({ key: 'test', text: 'Prompt: {contextData}' });
    });
    (0, vitest_1.describe)('generateBlueprint (Strict Zone Adherence)', () => {
        (0, vitest_1.it)('should construct Zod Schema allowing ONLY symbols defined in Entity Zones', async () => {
            // 1. Mock Zones
            mockFindMany.mockResolvedValue([
                { name: 'Core', slug: 'core', symbol: '#', color: '#FFFFFF' },
                { name: 'Head', slug: 'head', symbol: 'O', color: '#FFFF00' }
            ]);
            // 2. Mock LangChain Response
            mockInvoke.mockResolvedValue({
                blueprint: Array(32).fill('................................')
            });
            // 3. Execute
            const config = {
                prompt: 'Test Blueprint',
                type: 'Monster',
                archetype: 'Humanoid',
                blueprint: [],
                width: 32,
                height: 32
            };
            await service.generateBlueprint(config);
            // 4. Verification
            (0, vitest_1.expect)(mockChatGoogleGenerativeAI).toHaveBeenCalled();
            // Check formatted Prompt for strict instructions
            (0, vitest_1.expect)(mockFindOne).toHaveBeenCalledWith({ where: { key: 'blueprint-architect' } });
            // Inspect the prompt string passed to invoke
            // Note: generateBlueprint calls invoke(formattedPrompt) where formattedPrompt is a STRING
            const promptString = mockInvoke.mock.calls[0][0];
            (0, vitest_1.expect)(promptString).toContain('STRICT LEGEND');
            (0, vitest_1.expect)(promptString).toContain('# : Core');
            (0, vitest_1.expect)(promptString).toContain('O : Head');
        });
        (0, vitest_1.it)('should map generated symbols to correct Zone Colors', async () => {
            mockFindMany.mockResolvedValue([
                { name: 'RedZone', slug: 'red', symbol: 'R', color: '#FF0000' }
            ]);
            mockInvoke.mockResolvedValue({
                blueprint: [
                    'RRRR............................',
                    '................................'
                    // ... implied rest
                ]
            });
            const result = await service.generateBlueprint({
                prompt: 'Red Thing', type: 'Item', archetype: 'Sword', blueprint: []
            });
            // The first 4 pixels should be #FF0000
            (0, vitest_1.expect)(result.pixelData[0][0]).toBe('#FF0000');
            (0, vitest_1.expect)(result.pixelData[0][1]).toBe('#FF0000');
            (0, vitest_1.expect)(result.pixelData[0][4]).toBe('transparent'); // '.' maps to transparent
        });
    });
    (0, vitest_1.describe)('generatePixelData (SOTA Context Injection)', () => {
        (0, vitest_1.it)('should inject Deep Entity Data when entityContext is provided', async () => {
            // 1. Mock Entity & Model
            const mockEntity = {
                id: 1,
                documentId: 'doc-123',
                name: 'Grommash',
                hp: 500,
                // Relations
                faction: { name: 'The Horde' },
                inventory: [{ name: 'Gorehowl' }, { name: 'Potion' }]
            };
            const mockModel = {
                info: { displayName: 'Orc Warlord' },
                attributes: {
                    name: { type: 'string' },
                    hp: { type: 'integer' },
                    faction: { type: 'relation' },
                    inventory: { type: 'relation' }
                }
            };
            mockFetchDeepContext.mockResolvedValue(mockEntity); // Context Service returns the entity
            mockGetModel.mockReturnValue(mockModel);
            mockInvoke.mockResolvedValue({ pixelData: [] });
            // 2. Execute
            const config = {
                prompt: 'Generate Grom',
                type: 'Monster',
                archetype: 'Humanoid',
                blueprint: [],
                entityContext: { uid: 'api::monster.monster', documentId: 'doc-123' }
            };
            await service.generatePixelData(config);
            // 3. Verify Context Injection
            // 3. Verify Context Injection
            // We now use contextService.fetchDeepContext instead of direct documents call
            (0, vitest_1.expect)(mockFetchDeepContext).toHaveBeenCalledWith('api::monster.monster', 'doc-123');
            // Inspect the messages passed to invoke
            // generatePixelData calls invoke([SystemMessage, HumanMessage]) -> Array!
            const messages = mockInvoke.mock.calls[0][0];
            const systemMsg = messages[0].content; // First message is SystemMessage
            (0, vitest_1.expect)(systemMsg).toContain('ENTITY TYPE: Orc Warlord');
            (0, vitest_1.expect)(systemMsg).toContain('ENTITY TYPE: Orc Warlord');
            (0, vitest_1.expect)(systemMsg).toContain('"name": "Grommash"');
            (0, vitest_1.expect)(systemMsg).toContain('"hp": 500');
            (0, vitest_1.expect)(systemMsg).toContain('"name": "The Horde"'); // Nested Faction
            (0, vitest_1.expect)(systemMsg).toContain('"name": "Gorehowl"'); // Nested Inventory
        });
        (0, vitest_1.it)('should fallback to EntityData (Shallow) if Deep Fetch fails', async () => {
            mockFetchDeepContext.mockRejectedValue(new Error('DB Error'));
            mockInvoke.mockResolvedValue({ pixelData: [] });
            const config = {
                prompt: 'Fallback Test',
                type: 'Sprite',
                archetype: 'Humanoid',
                blueprint: [],
                entityContext: { uid: 'api::monster.monster', documentId: 'bad-id' },
                entityData: { name: 'Shallow Orc', strength: 18 } // Fallback data
            };
            await service.generatePixelData(config);
            const messages = mockInvoke.mock.calls[0][0];
            const systemMsg = messages[0].content;
            (0, vitest_1.expect)(systemMsg).toContain('ENTITY CONTEXT (Draft/Shallow)');
            (0, vitest_1.expect)(systemMsg).toContain('Shallow Orc');
            (0, vitest_1.expect)(systemMsg).toContain('strength: 18');
        });
    });
});
