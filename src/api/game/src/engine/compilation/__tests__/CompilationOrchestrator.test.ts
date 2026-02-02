import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompilationOrchestrator } from '../CompilationOrchestrator';

// Mock Global Strapi
const mockFindMany = vi.fn();
const mockFindOne = vi.fn();
const mockUpdate = vi.fn();
const mockLogInfo = vi.fn();
const mockLogWarn = vi.fn();
const mockLogError = vi.fn();

const mockStrapi = {
  entityService: {
    findMany: mockFindMany,
    findOne: mockFindOne,
    update: mockUpdate,
  },
  log: {
    info: mockLogInfo,
    warn: mockLogWarn,
    error: mockLogError,
  },
};

(global as any).strapi = mockStrapi;

describe('CompilationOrchestrator', () => {
  let orchestrator: CompilationOrchestrator;

  beforeEach(() => {
    vi.clearAllMocks();
    orchestrator = new CompilationOrchestrator();
  });

  describe('runPhase', () => {
    it('should iterate over content types for the phase', async () => {
      // Mock findMany to return empty for simplicity
      mockFindMany.mockResolvedValue([]);

      await orchestrator.runPhase('Atom');

      // Atom phase has damage-type and status-effect
      expect(mockFindMany).toHaveBeenCalledWith('api::damage-type.damage-type', expect.any(Object));
      expect(mockFindMany).toHaveBeenCalledWith('api::status-effect.status-effect', expect.any(Object));
      expect(mockLogInfo).toHaveBeenCalledWith(expect.stringContaining('Starting Phase: Atom'));
    });
  });

  describe('compileEntity', () => {
    it('should select correct compiler and update entity on success', async () => {
      const mockEntity = { id: 1, slug: 'fire' };
      // DamageTypeCompiler expects slug
      
      await orchestrator.compileEntity('api::damage-type.damage-type', 1, mockEntity);

      // Should save result
      expect(mockUpdate).toHaveBeenCalledWith('api::damage-type.damage-type', 1, expect.objectContaining({
        data: expect.objectContaining({
          compilation_state: expect.objectContaining({
            version: '1.0.0'
          })
        })
      }));
      expect(mockLogInfo).toHaveBeenCalledWith(expect.stringContaining('Valid'));
    });

    it('should fetch entity if not provided', async () => {
      mockFindOne.mockResolvedValue({ id: 2, slug: 'cold' });

      await orchestrator.compileEntity('api::damage-type.damage-type', 2);

      expect(mockFindOne).toHaveBeenCalledWith('api::damage-type.damage-type', 2, expect.any(Object));
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should log error if entity not found', async () => {
      mockFindOne.mockResolvedValue(null);

      await orchestrator.compileEntity('api::damage-type.damage-type', 999);

      expect(mockLogError).toHaveBeenCalledWith(expect.stringContaining('Entity not found'));
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should warn if no compiler found', async () => {
      const mockEntity = { id: 1 };
      await orchestrator.compileEntity('api::unknown.unknown', 1, mockEntity);

      expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining('No compiler found'));
    });

    it('should handle compiler errors smoothly', async () => {
      const mockEntity = { id: 1, slug: 'invalid-type' };
      // DamageTypeCompiler will fail on 'invalid-type'

      await orchestrator.compileEntity('api::damage-type.damage-type', 1, mockEntity);

      // Should still update the entity with Invalid status
      expect(mockUpdate).toHaveBeenCalled(); // Update with success=false/Invalid
      expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining('Invalid')); // Logs result status
    });
  });
});
