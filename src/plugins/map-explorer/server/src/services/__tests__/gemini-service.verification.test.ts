import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
// import geminiServiceFactory from '../gemini-service';

// Mock LangChain
const { mockInvoke, mockChatGoogleGenerativeAI } = vi.hoisted(() => {
  const mockInvoke = vi.fn();
  const mockWithStructuredOutput = vi.fn().mockReturnValue({ invoke: mockInvoke });
  const mockChatGoogleGenerativeAI = vi.fn(function () {
    return { withStructuredOutput: mockWithStructuredOutput };
  });
  return { mockInvoke, mockWithStructuredOutput, mockChatGoogleGenerativeAI };
});

vi.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: mockChatGoogleGenerativeAI,
}));

describe('GeminiService Verification (Strict & SOTA)', () => {
  let geminiServiceFactory: any;
  let service: any;

  // Mock Strapi
  const mockFindOne = vi.fn();
  const mockFindMany = vi.fn();
  const mockDocFindOne = vi.fn();

  // Schema Introspection Mocks
  const mockGetModel = vi.fn();

  // Context Service Mock
  const mockFetchDeepContext = vi.fn();

  const mockStrapi = {
    log: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    db: {
      query: (_uid: string) => ({
        findOne: mockFindOne,
        findMany: mockFindMany,
      }),
    },
    documents: (_uid: string) => ({
      findOne: mockDocFindOne,
    }),
    getModel: mockGetModel,
    plugin: (_name: string) => ({
      service: (_name: string) => ({
        fetchDeepContext: mockFetchDeepContext,
      }),
      config: vi.fn().mockImplementation((key) => {
        if (key === 'contentTypes')
          return {
            prompt: 'api::prompt.prompt',
            entity: 'api::entity.entity',
            item: 'api::item.item',
            zone: 'api::zone.zone',
          };
        return {};
      }),
    }),
  };

  beforeAll(async () => {
    geminiServiceFactory = (await import('../gemini-service')).default;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'verification-key';
    service = geminiServiceFactory({ strapi: mockStrapi as any });

    // Default Prompt Templates - Use single braces for LangChain
    mockFindOne.mockResolvedValue({ key: 'test', text: 'Prompt: {contextData}' });
  });

  describe('generateBlueprint (Strict Zone Adherence)', () => {
    it('should construct Zod Schema allowing ONLY symbols defined in Entity Zones', async () => {
      // 1. Mock Zones
      mockFindMany.mockResolvedValue([
        { name: 'Core', slug: 'core', symbol: '#', color: '#FFFFFF' },
        { name: 'Head', slug: 'head', symbol: 'O', color: '#FFFF00' },
      ]);

      // 2. Mock LangChain Response
      mockInvoke.mockResolvedValue({
        blueprint: Array(32).fill('................................'),
      });

      // 3. Execute
      const config = {
        prompt: 'Test Blueprint',
        type: 'Monster' as const,
        archetype: 'Humanoid',
        blueprint: [],
        width: 32,
        height: 32,
      };

      await service.generateBlueprint(config);

      // 4. Verification
      expect(mockChatGoogleGenerativeAI).toHaveBeenCalled();

      // Check formatted Prompt for strict instructions
      expect(mockFindOne).toHaveBeenCalledWith({ where: { key: 'blueprint-architect' } });

      // Inspect the prompt string passed to invoke
      // Note: generateBlueprint calls invoke(formattedPrompt) where formattedPrompt is a STRING
      const promptString = mockInvoke.mock.calls[0][0];

      expect(promptString).toContain('STRICT LEGEND');
      expect(promptString).toContain('# : Core');
      expect(promptString).toContain('O : Head');
    });

    it('should map generated symbols to correct Zone Colors', async () => {
      mockFindMany.mockResolvedValue([
        { name: 'RedZone', slug: 'red', symbol: 'R', color: '#FF0000' },
      ]);

      mockInvoke.mockResolvedValue({
        blueprint: [
          'RRRR............................',
          '................................',
          // ... implied rest
        ],
      });

      const result = await service.generateBlueprint({
        prompt: 'Red Thing',
        type: 'Item' as const,
        archetype: 'Sword',
        blueprint: [],
      });

      // The first 4 pixels should be #FF0000
      expect(result.pixelData[0][0]).toBe('#FF0000');
      expect(result.pixelData[0][1]).toBe('#FF0000');
      expect(result.pixelData[0][4]).toBe('transparent'); // '.' maps to transparent
    });
  });

  describe('generatePixelData (SOTA Context Injection)', () => {
    it('should inject Deep Entity Data when entityContext is provided', async () => {
      // 1. Mock Entity & Model
      const mockEntity = {
        id: 1,
        documentId: 'doc-123',
        name: 'Grommash',
        hp: 500,
        // Relations
        faction: { name: 'The Horde' },
        inventory: [{ name: 'Gorehowl' }, { name: 'Potion' }],
      };

      const mockModel = {
        info: { displayName: 'Orc Warlord' },
        attributes: {
          name: { type: 'string' },
          hp: { type: 'integer' },
          faction: { type: 'relation' },
          inventory: { type: 'relation' },
        },
      };

      mockFetchDeepContext.mockResolvedValue(mockEntity); // Context Service returns the entity
      mockGetModel.mockReturnValue(mockModel);

      mockInvoke.mockResolvedValue({ pixelData: [] });

      // 2. Execute
      const config = {
        prompt: 'Generate Grom',
        type: 'Monster' as const,
        archetype: 'Humanoid',
        blueprint: [],
        entityContext: { uid: 'api::monster.monster', documentId: 'doc-123' },
      };

      await service.generatePixelData(config);

      // 3. Verify Context Injection
      // 3. Verify Context Injection
      // We now use contextService.fetchDeepContext instead of direct documents call
      expect(mockFetchDeepContext).toHaveBeenCalledWith('api::monster.monster', 'doc-123');

      // Inspect the messages passed to invoke
      // generatePixelData calls invoke([SystemMessage, HumanMessage]) -> Array!
      const messages = mockInvoke.mock.calls[0][0];
      const systemMsg = messages[0].content; // First message is SystemMessage

      expect(systemMsg).toContain('ENTITY TYPE: Orc Warlord');
      expect(systemMsg).toContain('ENTITY TYPE: Orc Warlord');
      expect(systemMsg).toContain('"name": "Grommash"');
      expect(systemMsg).toContain('"hp": 500');
      expect(systemMsg).toContain('"name": "The Horde"'); // Nested Faction
      expect(systemMsg).toContain('"name": "Gorehowl"'); // Nested Inventory
    });

    it('should fallback to EntityData (Shallow) if Deep Fetch fails', async () => {
      mockFetchDeepContext.mockRejectedValue(new Error('DB Error'));
      mockInvoke.mockResolvedValue({ pixelData: [] });

      const config = {
        prompt: 'Fallback Test',
        type: 'Sprite' as const,
        archetype: 'Humanoid',
        blueprint: [],
        entityContext: { uid: 'api::monster.monster', documentId: 'bad-id' },
        entityData: { name: 'Shallow Orc', strength: 18 }, // Fallback data
      };

      await service.generatePixelData(config);

      const messages = mockInvoke.mock.calls[0][0];
      const systemMsg = messages[0].content;

      expect(systemMsg).toContain('ENTITY CONTEXT (Draft/Shallow)');
      expect(systemMsg).toContain('Shallow Orc');
      expect(systemMsg).toContain('strength: 18');
    });
  });
});
