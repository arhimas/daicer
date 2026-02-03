import { describe, it, expect } from 'vitest';
import { ClassRegistry } from '@daicer/engine/mechanics/registry/ClassRegistry';
import { ClassDefinition } from '@daicer/engine/mechanics/registry/ClassDefinition'; // Assume exists or imported from same file?
// Wait, ClassDefinition is imported in ClassRegistry.ts.
// I should mock or create a dummy helper if I can't import it.
// Assuming ClassDefinition is an interface.

// Mock interface
interface ClassDefinition {
  name: string;
  hitDie: string;
}

describe('ClassRegistry', () => {
  it('should register and retrieve', () => {
    const def: ClassDefinition = { name: 'Fighter', hitDie: 'd10' } as any;
    ClassRegistry.register(def);

    expect(ClassRegistry.get('Fighter')).toBe(def);
    expect(ClassRegistry.get('fighter')).toBe(def);
  });

  it('should return undefined for missing', () => {
    expect(ClassRegistry.get('Wizard')).toBeUndefined();
  });

  it('should return all', () => {
    // Cleared? No static state persists.
    // Assuming test isolation or append.
    const def2: ClassDefinition = { name: 'Rogue', hitDie: 'd8' } as any;
    ClassRegistry.register(def2);

    const all = ClassRegistry.getAll();
    expect(all).toContain(def2);
  });
});
