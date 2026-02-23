import { describe, it, expect, vi, beforeEach } from 'vitest';
import entityLifecycleFactory from '@/api/game/services/entity-lifecycle';

// Mock External Utils
const mockGenerateText = vi.fn();
const mockGetPrompt = vi.fn();
const mockFormatPrompt = vi.fn();
const mockUploadBase64Image = vi.fn();

// Relative paths for mocks to ensure resolution matches source (mapped via alias or relative)
// entity-lifecycle uses '@/utils/llm'. resolving from this test file:
// ../../../../utils/llm
vi.mock('../../../../utils/llm', () => ({
  generateText: (...args: any[]) => mockGenerateText(...args),
}));

vi.mock('../../../../utils/prompt', () => ({
  getPrompt: (...args: any[]) => mockGetPrompt(...args),
  formatPrompt: (...args: any[]) => mockFormatPrompt(...args),
}));

vi.mock('../../../../utils/upload', () => ({
  uploadBase64Image: (...args: any[]) => mockUploadBase64Image(...args),
}));

// Mock Engine Utils
const mockCreateCharacterSnapshot = vi.fn();
const mockFormatDmInstruction = vi.fn();
const mockDerive = vi.fn();

vi.mock('@/api/game/src/engine', () => ({
  createCharacterSnapshot: (...args: any[]) => mockCreateCharacterSnapshot(...args),
  formatDmInstruction: (...args: any[]) => mockFormatDmInstruction(...args),
  EntityDeriver: {
    derive: (...args: any[]) => mockDerive(...args),
  },
}));

// Mock Strapi
const mockFindMany = vi.fn();
const mockFindOne = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockLogInfo = vi.fn();
const mockLogWarn = vi.fn();
const mockLogError = vi.fn();

const mockStrapi: any = {
  documents: vi.fn(() => ({
    findMany: mockFindMany,
    findOne: mockFindOne,
    create: mockCreate,
    update: mockUpdate,
  })),
  log: {
    info: mockLogInfo,
    warn: mockLogWarn,
    error: mockLogError,
  },
};

describe('Entity Lifecycle Service', () => {
  let service: any;

  beforeEach(() => {
    vi.resetAllMocks(); // Changed from clearAllMocks to ensure clean slate
    service = entityLifecycleFactory({ strapi: mockStrapi });

    // Default Mocks
    mockGenerateText.mockResolvedValue('Generated Text');
    // Return valid prompt template defaults
    mockGetPrompt.mockImplementation((key) => {
      if (key.includes('system')) return 'System {{worldContext}}';
      if (key.includes('user')) return 'User {{val}}';
      return 'Prompt';
    });
    mockFormatPrompt.mockImplementation((t) => `Formatted: ${t}`);
    mockUploadBase64Image.mockResolvedValue({ id: 'img1', url: 'url1' });
    mockCreateCharacterSnapshot.mockImplementation((s) => ({ id: s.documentId, name: s.name }));
    mockDerive.mockReturnValue({
      level: 1,
      hp: 10,
      maxHp: 10,
      ac: 10,
      speed: { walk: 30 },
      structuredActions: [],
    });
  });

  describe('createSnapshot', () => {
    it('should map entities and handle invalid inputs', () => {
      const sheets = [
        { documentId: 's1', name: 'Sheet 1' },
        { documentId: 's2', name: 'Sheet 2' },
        null,
        undefined,
        'invalid-string',
      ];
      const result = service.createSnapshot(sheets);
      expect(result).toHaveProperty('s1');
      expect(result).toHaveProperty('s2');
      expect(Object.keys(result)).toHaveLength(2);
      expect(mockCreateCharacterSnapshot).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateEntityOpening', () => {
    it('should format prompt and generate text', async () => {
      await service.generateEntityOpening('World', { name: 'Hero' }, 'Ctx', 'en');
      expect(mockFormatPrompt).toHaveBeenCalled();
      expect(mockGenerateText).toHaveBeenCalled();
    });

    it('should handle complex nested race/class objects', async () => {
      const sheet = {
        name: 'Complex Hero',
        race: { name: 'High Elf' },
        classes: [{ class: { name: 'Wizard' }, level: 1 }],
        personality: { traits: 'Brave' },
        attributes: { Strength: 18 },
      };
      await service.generateEntityOpening('World', sheet, 'Ctx', 'en');
      expect(mockGenerateText).toHaveBeenCalled();
    });

    it('should fallback for missing race/class', async () => {
      const sheet = { name: 'Mystery Hero' };
      await service.generateEntityOpening('World', sheet, 'Ctx', 'en');
      expect(mockGenerateText).toHaveBeenCalled();
    });
  });

  describe('generateMainOpening', () => {
    it('should format prompt and generate text for party', async () => {
      await service.generateMainOpening('World', []);
      expect(mockFormatPrompt).toHaveBeenCalled();
      expect(mockGenerateText).toHaveBeenCalled();
    });

    it('should handle party with complex sheets', async () => {
      const players = [
        {
          name: 'P1',
          characterSheet: {
            name: 'Hero',
            race: { name: 'Dwarf' },
            classes: [{ class: { name: 'Cleric' } }],
            description: 'A stout dwarf.',
          },
        },
        {
          name: 'P2',
          characterSheet: {
            name: 'Ranger',
            race: 'Elf',
            class: 'Ranger',
          },
        },
        { name: 'P3', characterSheet: null }, // No sheet
      ];
      await service.generateMainOpening('World', players);
      expect(mockGenerateText).toHaveBeenCalled();
    });
  });

  describe('onboardPlayer', () => {
    it('should create entity and sheet', async () => {
      // 1. Room Fetch
      mockFindMany.mockResolvedValueOnce([
        {
          documentId: 'r1',
          players: [{ user: { documentId: 'u1', id: 'u1' } }],
        },
      ]);
      mockFindOne.mockResolvedValue(null); // Entity check (if used)

      // 2. Race Lookup
      mockFindMany.mockResolvedValueOnce([{ documentId: 'race1', name: 'Human' }]);
      // 3. Class Lookup
      mockFindMany.mockResolvedValueOnce([{ documentId: 'class1', name: 'Fighter' }]);

      // Create Entity then Sheet
      mockCreate.mockResolvedValue({ documentId: 'newId', name: 'N', stats: {} });

      await service.onboardPlayer(
        'r1',
        { name: 'Hero', race: 'Human', class: 'Fighter' },
        { documentId: 'u1', id: 'u1', username: 'U1' }
      );

      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should handle avatar upload failure gracefully', async () => {
      mockUploadBase64Image.mockRejectedValue(new Error('Upload failed'));
      // Mock findMany for room - WITH PLAYER
      mockFindMany.mockResolvedValueOnce([{ documentId: 'r1', players: [{ user: { documentId: 'u1' } }] }]);
      // Mock findOne (entity not found)
      mockFindOne.mockResolvedValue(null);
      // Mock race/class
      mockFindMany.mockResolvedValueOnce([{ documentId: 'race1' }]);
      mockFindMany.mockResolvedValueOnce([{ documentId: 'class1' }]);
      mockCreate.mockResolvedValue({ documentId: 'newId', stats: {} });

      const result = await service.onboardPlayer(
        'r1',
        {
          name: 'Player',
          avatarPreview: { portrait: { data: 'abc', mimeType: 'image/png' } },
        },
        { documentId: 'u1', id: 'u1', username: 'U' }
      );

      expect(result.entity).toBeDefined();
      expect(mockLogError).toHaveBeenCalled();
    });

    it('should handle missing race and class data gracefully', async () => {
      // Mock findMany for room - WITH PLAYER
      mockFindMany.mockResolvedValueOnce([{ documentId: 'r1', players: [{ user: { documentId: 'u1' } }] }]);
      mockFindOne.mockResolvedValue(null);
      // Return empty for race/class
      mockFindMany.mockResolvedValueOnce([]); // No race
      mockFindMany.mockResolvedValueOnce([]); // No class
      mockCreate.mockResolvedValue({ documentId: 'newId', stats: {}, classes: [] });

      const result = await service.onboardPlayer(
        'r1',
        { name: 'Player', race: 'NonExistent', class: 'NonExistent' },
        { documentId: 'u1' }
      );
      expect(result.entity.race).toBeUndefined();
      expect(result.entity.classes).toEqual([]);
    });

    it('should throw error if player not in room', async () => {
      mockFindMany.mockResolvedValueOnce([{ documentId: 'r1', players: [] }]); // Room with NO players
      mockFindOne.mockResolvedValue(null);
      mockFindMany.mockResolvedValueOnce([]);
      mockFindMany.mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue({ documentId: 'newId', stats: {} });

      await expect(service.onboardPlayer('r1', { name: 'Player' }, { documentId: 'u1' })).rejects.toThrow(
        'User is not a player'
      );
    });

    it('should link to existing entity if documentId provided', async () => {
      mockFindMany.mockResolvedValueOnce([{ documentId: 'r1', players: [{ user: { documentId: 'u1' } }] }]);
      mockFindOne.mockResolvedValue({ documentId: 'e1', name: 'Existing', stats: {}, classes: [] });
      // Mock Create for Sheet
      mockCreate.mockResolvedValue({ documentId: 'sheet1' });

      const result = await service.onboardPlayer('r1', { name: 'Player', documentId: 'e1' }, { documentId: 'u1' });
      expect(result.entity.documentId).toBe('e1');
    });

    it('should fallback to creation if linked entity not found', async () => {
      mockFindMany.mockResolvedValueOnce([{ documentId: 'r1', players: [{ user: { documentId: 'u1' } }] }]);
      mockFindOne.mockResolvedValue(null);
      // Race/Class defaults
      mockFindMany.mockResolvedValueOnce([]);
      mockFindMany.mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue({ documentId: 'newId', name: 'Player', stats: {} });

      const result = await service.onboardPlayer('r1', { name: 'Player', documentId: 'e1' }, { documentId: 'u1' });
      expect(result.entity.documentId).toBe('newId');
      expect(mockLogWarn).toHaveBeenCalled();
    });
  });
});
