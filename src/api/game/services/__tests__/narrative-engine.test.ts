import { describe, it, expect, vi, beforeEach } from 'vitest';
import narrativeEngineFactory from '@/api/game/services/narrative-engine';

// Mock dependencies
const mockGenerateStructured = vi.fn();
const mockGetPrompt = vi.fn();
const mockPromptBuilder = {
  buildSystemPrompt: vi.fn(),
};

// Mock modules
// From src/api/game/services/__tests__/
vi.mock('../../../../utils/llm/structured', () => ({
  generateStructured: (...args: any[]) => mockGenerateStructured(...args),
}));

vi.mock('../../../../utils/prompt', () => ({
  getPrompt: (...args: any[]) => mockGetPrompt(...args),
}));

// Mock dynamic imports
// Service imports: await import('../src/engine/narrator/PromptBuilder')
// From service: ../src/engine -> src/api/game/src/engine
// From test: ../../src/engine -> src/api/game/src/engine
vi.mock('../../src/engine/narrator/PromptBuilder', () => ({
  PromptBuilder: mockPromptBuilder,
}));

vi.mock('../../../../schemas/agent-responses', () => ({
  TurnResponseSchema: { type: 'object' },
}));

const mockStrapi = {
  log: {
    info: vi.fn(),
    error: vi.fn(), // Added error mock
    warn: vi.fn(),
  },
};

describe('Narrative Engine Service', () => {
  const narrativeEngine = narrativeEngineFactory({ strapi: mockStrapi });

  const mockBaseArgs: any = {
    roomId: 'room-1',
    worldDescription: 'A dark cave.',
    messages: [
      { sender: 'Hero', text: 'I attack!' },
      { sender: 'DM', text: 'Roll for initiative.' },
    ],
    players: [
      {
        character: { name: 'Hero', currentHp: 10, maxHp: 20, ac: 15 },
        action: 'Attack Goblin',
      },
    ],
    entities: [
      { name: 'Hero', type: 'player', hp: 10, maxHp: 20, armorClass: 15, actions: [] },
      { name: 'Goblin', type: 'monster', hp: 5, maxHp: 10, armorClass: 12, actions: [] },
    ],
    settings: { logLevel: 'debug' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPrompt.mockResolvedValue('System Prompt Template');
    mockPromptBuilder.buildSystemPrompt.mockReturnValue('Built System Prompt');
    mockGenerateStructured.mockResolvedValue({ overall_summary: 'Result' });
  });

  // ... error test ...

  it('should generate narrative response successfully (Happy Path)', async () => {
    const _result = await narrativeEngine.generateNarrativeResponse(
      mockBaseArgs.roomId,
      mockBaseArgs.worldDescription,
      mockBaseArgs.messages,
      mockBaseArgs.players,
      mockBaseArgs.entities,
      'en',
      mockBaseArgs.settings
    );

    // Verify dependencies called
    expect(mockGetPrompt).toHaveBeenCalledWith('dm_system_instruction', 'en', ''); // REMOVED fallback arg
    expect(mockPromptBuilder.buildSystemPrompt).toHaveBeenCalled();
    expect(mockGenerateStructured).toHaveBeenCalled();

    // Check Prompt Construction (User Prompt part)
    const callArgs = mockGenerateStructured.mock.calls[0];
    const fullPrompt = callArgs[2];
    expect(fullPrompt).toContain('PREVIOUS STORY:');
    expect(fullPrompt).toContain('Hero: I attack!');
    expect(fullPrompt).toContain('CURRENT TURN ACTIONS:');
    expect(fullPrompt).toContain('Hero: Attack Goblin');
    expect(fullPrompt).not.toContain('[Image Attached]');
  });

  it('should handle map image attachment', async () => {
    const fakeBuffer = Buffer.from('fake-image');
    await narrativeEngine.generateNarrativeResponse(
      mockBaseArgs.roomId,
      mockBaseArgs.worldDescription,
      mockBaseArgs.messages,
      mockBaseArgs.players,
      mockBaseArgs.entities,
      'en',
      mockBaseArgs.settings,
      undefined,
      undefined,
      fakeBuffer
    );

    const callArgs = mockGenerateStructured.mock.calls[0];
    const fullPrompt = callArgs[2];
    expect(fullPrompt).toContain('[Image Attached]');

    const options = callArgs[4];
    expect(options.images).toEqual([fakeBuffer]);
  });

  it('should filter out player entities from context', async () => {
    await narrativeEngine.generateNarrativeResponse(
      mockBaseArgs.roomId,
      mockBaseArgs.worldDescription,
      mockBaseArgs.messages,
      mockBaseArgs.players,
      mockBaseArgs.entities, // Contains 1 player, 1 monster
      'en'
    );

    const builderCall = mockPromptBuilder.buildSystemPrompt.mock.calls[0][0];
    // Entities passed to builder should NOT contain type: 'player'
    expect(builderCall.entities).toHaveLength(1);
    expect(builderCall.entities[0].name).toBe('Goblin');
  });

  it('should handle unknown language code by defaulting to English', async () => {
    await narrativeEngine.generateNarrativeResponse(
      mockBaseArgs.roomId,
      mockBaseArgs.worldDescription,
      [],
      [],
      [],
      'fr' as any // 'fr' is not in the map
    );

    const callArgs = mockGenerateStructured.mock.calls[0];
    // Should default to English text in prompt
    expect(callArgs[2]).toContain('Respond entirely in English');
  });

  it('should handle known language code (es)', async () => {
    await narrativeEngine.generateNarrativeResponse(
      mockBaseArgs.roomId,
      mockBaseArgs.worldDescription,
      [],
      [],
      [],
      'es'
    );
    const callArgs = mockGenerateStructured.mock.calls[0];
    expect(callArgs[2]).toContain('Respond entirely in Spanish');
  });

  it('should handle missing players or characters gracefully', async () => {
    const playersWithoutChar = [{ id: 'p2' }]; // No character prop
    await narrativeEngine.generateNarrativeResponse(
      mockBaseArgs.roomId,
      mockBaseArgs.worldDescription,
      [],
      playersWithoutChar,
      [],
      'en'
    );

    const builderCall = mockPromptBuilder.buildSystemPrompt.mock.calls[0][0];
    expect(builderCall.players[0].name).toBe('Unknown');
    expect(builderCall.players[0].hp).toBeUndefined();
  });
});
