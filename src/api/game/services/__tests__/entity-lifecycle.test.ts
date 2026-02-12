import { vi, describe, it, expect, beforeEach } from 'vitest';
import entityLifecycleFactory from '../entity-lifecycle';
import { EntityDeriver } from '@/api/game/src/engine';

// Mocks
const mockGenerateText = vi.fn();
const mockGetPrompt = vi.fn();
const mockFormatPrompt = vi.fn();
const mockUploadBase64Image = vi.fn();
const mockCreateCharacterSnapshot = vi.fn();

vi.mock('@/utils/llm', () => ({
  generateText: (...args) => mockGenerateText(...args),
}));

vi.mock('@/utils/prompt', () => ({
  getPrompt: (...args) => mockGetPrompt(...args),
  formatPrompt: (...args) => mockFormatPrompt(...args),
}));

vi.mock('@/utils/upload', () => ({
  uploadBase64Image: (...args) => mockUploadBase64Image(...args),
}));

vi.mock('@/api/game/src/engine', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    createCharacterSnapshot: (...args) => mockCreateCharacterSnapshot(...args),
    EntityDeriver: {
      derive: vi.fn(),
    },
    formatDmInstruction: vi.fn((style) => `Style: ${style}`),
  };
});

describe('Entity Lifecycle Service', () => {
  let strapi: any;
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();

    strapi = {
      log: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
      },
      documents: vi.fn(),
    };

    service = entityLifecycleFactory({ strapi });
  });

  describe('createSnapshot', () => {
    it('should create snapshots for valid sheets', () => {
      const sheets = [
        { documentId: 'doc-1', name: 'Hero' },
        null,
        { documentId: 'doc-2', name: 'Villain' },
      ];

      mockCreateCharacterSnapshot.mockImplementation((s) => ({ ...s, snapshot: true }));

      const result = service.createSnapshot(sheets);

      expect(result).toHaveProperty('doc-1');
      expect(result).toHaveProperty('doc-2');
      expect(result['doc-1']).toEqual({ documentId: 'doc-1', name: 'Hero', snapshot: true });
    });
  });

  describe('onboardPlayer', () => {
    it('should throw if room not found', async () => {
      strapi.documents.mockReturnValue({
        findMany: vi.fn().mockResolvedValue([]),
      });

      await expect(
        service.onboardPlayer('room-1', {}, { documentId: 'user-1' })
      ).rejects.toThrow('Room not found');
    });

    it('should throw if user is not in the room', async () => {
      strapi.documents.mockReturnValue({
        findMany: vi.fn().mockResolvedValue([
          {
            documentId: 'room-1',
            players: [{ user: { documentId: 'other-user', id: 'o1' } }],
          },
        ]),
        create: vi.fn().mockResolvedValue({ documentId: 'new-entity', stats: {} }),
        findOne: vi.fn(),
        update: vi.fn(),
      });

      (EntityDeriver.derive as any).mockReturnValue({ level: 1, hp: 10, maxHp: 10, ac: 10, speed: { walk: 30 } });

      await expect(
        service.onboardPlayer('room-1', { name: 'Hero' }, { documentId: 'user-1', id: 'u1' })
      ).rejects.toThrow('User is not a player in this room');
    });

    it('should create new entity and sheet successfully', async () => {
      const mockRoom = {
        documentId: 'room-1',
        players: [{ user: { documentId: 'user-1' }, name: 'OldName' }],
      };

      const mockRace = { documentId: 'race-1', name: 'Human', speed: 30 };
      const mockClass = { documentId: 'class-1', name: 'Fighter', hit_die: 10 };

      // Mock Documents
      const findManyMock = vi.fn().mockImplementation(async ({ filters }) => {
        if (filters?.$or) return [mockRoom]; // Room lookup
        if (filters?.name === 'Human') return [mockRace];
        if (filters?.name === 'Fighter') return [mockClass];
        return [];
      });

      const createMock = vi.fn().mockImplementation(async ({ data }) => {
        return { documentId: `new-${Date.now()}`, ...data };
      });

      const updateMock = vi.fn().mockResolvedValue({});

      strapi.documents.mockReturnValue({
        findMany: findManyMock,
        create: createMock,
        update: updateMock,
      });

      // Mock Deriver
      (EntityDeriver.derive as any).mockReturnValue({
        level: 1,
        hp: 12,
        maxHp: 12,
        ac: 15,
        speed: { walk: 30 },
        structuredActions: [],
      });

      const entityData = {
        name: 'MyHero',
        race: 'Human',
        class: 'Fighter',
        baseStats: { Strength: 15 },
      };

      const result = await service.onboardPlayer('room-1', entityData, { documentId: 'user-1' });

      expect(strapi.documents).toHaveBeenCalledWith('api::entity.entity');
      expect(createMock).toHaveBeenCalledTimes(2); // Entity + Sheet
      
      // Check Entity Creation
      const entityCall = createMock.mock.calls[0][0];
      expect(entityCall.data.name).toBe('MyHero');
      expect(entityCall.data.race).toBe('race-1');

      // Check Sheet Creation
      const sheetCall = createMock.mock.calls[1][0];
      expect(sheetCall.data.currentHp).toBe(12);
      expect(sheetCall.data.room).toBe('room-1');

      // Check Room Update
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
        documentId: 'room-1',
        data: {
          players: expect.arrayContaining([
            expect.objectContaining({ name: 'MyHero', isReady: false }),
          ]),
        },
      }));
    });

    it('should handle avatar uploads', async () => {
       const mockRoom = {
        documentId: 'room-1',
        players: [{ user: { documentId: 'user-1' } }],
      };

      strapi.documents.mockReturnValue({
        findMany: vi.fn().mockResolvedValue([mockRoom]),
        create: vi.fn().mockResolvedValue({ documentId: 'new-doc', stats: {} }),
        update: vi.fn().mockResolvedValue({}),
      });

      (EntityDeriver.derive as any).mockReturnValue({ speed: { walk: 30 } });
      mockUploadBase64Image.mockResolvedValue({ id: 99, url: 'img.jpg' });

      const entityData = {
        name: 'AvatarHero',
        avatarPreview: {
          portrait: { data: 'base64data', mimeType: 'image/png' }
        }
      };

      await service.onboardPlayer('room-1', entityData, { documentId: 'user-1', id: '123' });

      expect(mockUploadBase64Image).toHaveBeenCalled();
      expect(strapi.documents).toHaveBeenCalledWith('api::entity.entity');
      // Verify image attached to entity
      const createCall = strapi.documents('api::entity.entity').create.mock.calls[0][0];
      expect(createCall.data.image).toBe(99);
    });
  });

  describe('generateEntityOpening', () => {
    it('should call LLM with correct prompts', async () => {
      const sheet = { name: 'Hero', race: 'Human', class: 'Fighter' };
      mockGetPrompt.mockResolvedValue('System {{worldContext}} / User {{characterName}}');
      mockFormatPrompt.mockImplementation((t, v) => JSON.stringify(v));
      mockGenerateText.mockResolvedValue('Opening text');

      const result = await service.generateEntityOpening('Dark World', sheet, 'Main Quest');

      expect(result).toBe('Opening text');
      expect(mockGetPrompt).toHaveBeenCalledTimes(2);
      expect(mockGenerateText).toHaveBeenCalled();
    });
  });

  describe('generateMainOpening', () => {
    it('should generate opening for party', async () => {
      const players = [
        { name: 'P1', characterSheet: { name: 'C1', race: 'Elf', class: 'Wizard' } },
      ];
      mockGetPrompt.mockResolvedValue('System {{partyContext}}');
      mockFormatPrompt.mockImplementation((t, v) => JSON.stringify(v));
      mockGenerateText.mockResolvedValue('Party Opening');

      const result = await service.generateMainOpening('World', players);

      expect(result).toBe('Party Opening');
      expect(mockGenerateText).toHaveBeenCalled();
    });
  });
});
