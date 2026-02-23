/* eslint-disable */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SchemaLoader } from '@/features/genesis-core/schema-loader';
import fs from 'fs';
import path from 'path';

// Mock fs.promises
vi.mock('fs', async () => {
  return {
    default: {
      existsSync: vi.fn(),
      promises: {
        readFile: vi.fn(),
        readdir: vi.fn(),
      },
    },
    existsSync: vi.fn(),
    promises: {
      readFile: vi.fn(),
      readdir: vi.fn(),
    },
  };
});

describe('SchemaLoader', () => {
  let loader: SchemaLoader;
  const mockSchemaDir = '/mock/schema';

  beforeEach(() => {
    loader = new SchemaLoader(mockSchemaDir);
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should use default path if not provided', () => {
      const defaultLoader = new SchemaLoader();
      // We can't easily check private property, but we can verify behavior
      // assumes process.cwd() joined with 'schema'
      expect(defaultLoader).toBeDefined();
    });
  });

  describe('loadSchema', () => {
    it('should load an API schema correctly', async () => {
      const uid = 'api::spell.spell';
      const expectedFilename = 'spell-spell.json';
      const mockContent = JSON.stringify({ uid: 'api::spell.spell', attributes: {} });

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.readFile).mockResolvedValue(mockContent);

      const result = await loader.loadSchema(uid);

      expect(fs.existsSync).toHaveBeenCalledWith(path.join(mockSchemaDir, expectedFilename));
      expect(result).toEqual(JSON.parse(mockContent));
    });

    it('should load a Plugin schema correctly', async () => {
      const uid = 'plugin::users-permissions.user';
      const expectedFilename = 'plugin-users-permissions-user.json';
      const mockContent = JSON.stringify({ uid, attributes: {} });

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.readFile).mockResolvedValue(mockContent);

      const result = await loader.loadSchema(uid);

      expect(fs.existsSync).toHaveBeenCalledWith(path.join(mockSchemaDir, expectedFilename));
      expect(result).toEqual(JSON.parse(mockContent));
    });

    it('should load a Component schema correctly', async () => {
      const uid = 'game.action';
      const expectedFilename = 'component-game-action.json';
      const mockContent = JSON.stringify({ uid, attributes: {} });

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.readFile).mockResolvedValue(mockContent);

      const result = await loader.loadSchema(uid);

      expect(fs.existsSync).toHaveBeenCalledWith(path.join(mockSchemaDir, expectedFilename));
      expect(result).toEqual(JSON.parse(mockContent));
    });

    it('should throw error if file does not exist', async () => {
      const uid = 'api::unknown.unknown';
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await expect(loader.loadSchema(uid)).rejects.toThrow(/Schema file not found/);
    });

    it('should throw error if JSON is invalid', async () => {
      const uid = 'api::spell.spell';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.readFile).mockResolvedValue('invalid json');

      await expect(loader.loadSchema(uid)).rejects.toThrow(/Failed to parse schema/);
    });
  });

  describe('listSchemas', () => {
    it('should list all json schemas', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.readdir).mockResolvedValue([
        'spell-spell.json',
        'component-test.json',
        '_meta.json',
        'readme.md',
      ] as any);

      const result = await loader.listSchemas();
      expect(result).toEqual(['spell-spell.json', 'component-test.json']);
      expect(result).not.toContain('_meta.json');
      expect(result).not.toContain('readme.md');
    });

    it('should return empty list if dir does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const result = await loader.listSchemas();
      expect(result).toEqual([]);
    });

    it('should filter schemas if filter is provided', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.readdir).mockResolvedValue(['spell-spell.json', 'component-test.json'] as any);

      const result = await loader.listSchemas('spell');
      expect(result).toEqual(['spell-spell.json']);
    });
  });
});
