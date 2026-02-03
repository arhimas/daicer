import { ConditionCompiler } from '@daicer/engine/compilation/atoms/ConditionCompiler';
import { DamageTypeCompiler } from '@daicer/engine/compilation/atoms/DamageTypeCompiler';
import { EntityCompiler } from '@daicer/engine/compilation/blueprints/EntityCompiler';
import { FeatureCompiler } from '@daicer/engine/compilation/molecules/FeatureCompiler';
import { CompilationResult } from '@daicer/engine/Compiler';

// Helper to extract error messages from logs
const getErrors = (result: CompilationResult) => result.logs.filter((l) => l.level === 'error').map((l) => l.message);

describe('Engine Compilers', () => {
  describe('ConditionCompiler', () => {
    const compiler = new ConditionCompiler();

    it('fails if slug is missing', async () => {
      const result = await compiler.compile({});
      expect(getErrors(result)).toContain('Missing slug');
    });

    it('validates correct conditions', async () => {
      const result = await compiler.compile({ slug: 'prone' }); // Matches ConditionType.Prone lowercase
      expect(getErrors(result)).toHaveLength(0);
    });

    it('validates prefixed slugs', async () => {
      const result = await compiler.compile({ slug: 'status-effect.prone' });
      expect(getErrors(result)).toHaveLength(0);
    });

    it('rejects unknown conditions', async () => {
      const result = await compiler.compile({ slug: 'super-sleepy' });
      expect(getErrors(result).length).toBeGreaterThan(0);
      expect(getErrors(result)[0]).toContain('Unknown Condition');
    });
  });

  describe('DamageTypeCompiler', () => {
    const compiler = new DamageTypeCompiler();

    it('fails if slug is missing', async () => {
      const result = await compiler.compile({});
      expect(getErrors(result)).toContain('Missing slug');
    });

    it('validates correct damage types', async () => {
      const result = await compiler.compile({ slug: 'fire' });
      expect(getErrors(result)).toHaveLength(0);
    });

    it('rejects unknown damage types', async () => {
      const result = await compiler.compile({ slug: 'emotional-damage' });
      expect(getErrors(result).length).toBeGreaterThan(0);
      expect(getErrors(result)[0]).toContain('Invalid DamageType slug');
    });
  });

  describe('FeatureCompiler', () => {
    const compiler = new FeatureCompiler();

    it('fails on missing slug', async () => {
      const result = await compiler.compile({});
      expect(getErrors(result)).toContain('Missing slug');
    });

    it('fails on missing name', async () => {
      const result = await compiler.compile({ slug: 'feat-1' });
      expect(getErrors(result)).toContain('Missing Name');
    });

    it('passes valid feature', async () => {
      const result = await compiler.compile({ slug: 'feat-1', name: 'Test Feat' });
      expect(getErrors(result)).toHaveLength(0);
    });
  });

  describe('EntityCompiler', () => {
    const compiler = new EntityCompiler();

    it('fails on missing slug or name', async () => {
      const result = await compiler.compile({});
      expect(getErrors(result)).toContain('Missing slug');
    });

    it('fails on missing stats', async () => {
      const result = await compiler.compile({ slug: 'goblin', name: 'Goblin', level: 1 });
      expect(getErrors(result)).toContain('Missing Stats Component');
    });

    it('validates sub-components of stats', async () => {
      const result = await compiler.compile({
        slug: 'goblin',
        name: 'Goblin',
        level: 1,
        stats: { strength: 10 }, // Missing others
      });
      expect(getErrors(result)).toContain('Missing Dexterity');
      expect(getErrors(result)).toContain('Missing Constitution');
    });

    it('passes a valid entity', async () => {
      const result = await compiler.compile({
        slug: 'goblin',
        name: 'Goblin',
        level: 1,
        stats: {
          strength: 10,
          dexterity: 12,
          constitution: 10,
          intelligence: 8,
          wisdom: 8,
          charisma: 8,
        },
      });
      expect(getErrors(result)).toHaveLength(0);
    });

    it('validates inventory relations', async () => {
      const result = await compiler.compile({
        slug: 'goblin',
        name: 'Goblin',
        level: 1,
        stats: {
          strength: 10,
          dexterity: 12,
          constitution: 10,
          intelligence: 8,
          wisdom: 8,
          charisma: 8,
        },
        inventory: [
          { id: 1 }, // Missing 'item' relation
          { id: 2, item: { id: 99, slug: 'sword' } },
        ],
      });
      expect(getErrors(result)).toContain('Inventory entry missing item relation');
    });
  });
});
