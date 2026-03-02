import { describe, it, expect } from 'vitest';
import { ItemMapper } from '@/features/genesis-core/mappers/item-mapper';
import { TraitMapper } from '@/features/genesis-core/mappers/trait-mapper';
import { ActionMapper } from '@/features/genesis-core/mappers/action-mapper';
import { ClassMapper } from '@/features/genesis-core/mappers/class-mapper';
import { FeatureMapper } from '@/features/genesis-core/mappers/feature-mapper';

describe('Genesis Core Mappers Complete Coverage', () => {
  it('covers ItemMapper mapping properties correctly', () => {
    const mockItem = { index: 'item-1', name: 'Sword', equipment_category: 'Weapon', desc: ['Sharp'] };
    const mapper = new ItemMapper();
    const mapped = mapper.map(mockItem as any);
    expect(mapped.uid).toBe('api::item.item');
    expect(mapped.name).toBe('Sword');
    expect(mapped.referenceId).toBe('item-1');
  });

  it('covers TraitMapper mapping properties correctly', () => {
    const mockTrait = { index: 'trait-1', name: 'Brave', desc: ['Fearless'] };
    const mapper = new TraitMapper();
    const mapped = mapper.map(mockTrait as any);
    expect(mapped.uid).toBe('api::trait.trait');
    expect(mapped.name).toBe('Brave');
  });

  it('covers ActionMapper mapping properties correctly', () => {
    const mockAction = { index: 'action-1', name: 'Strike', desc: 'Hit hard' };
    const mapper = new ActionMapper('Test Monster');
    const mapped = mapper.map(mockAction as any);
    expect(mapped.uid).toBe('api::action.action');
    expect(mapped.name).toBe('Test Monster: Strike');
  });

  it('covers ClassMapper mapping properties correctly', () => {
    const mockClass = { index: 'class-1', name: 'Fighter', hit_die: 10 };
    const mapper = new ClassMapper();
    const mapped = mapper.map(mockClass as any);
    expect(mapped.uid).toBe('api::class.class');
    expect(mapped.name).toBe('Fighter');
  });

  it('covers FeatureMapper mapping properties correctly', () => {
    const mockFeature = { index: 'feature-1', name: 'Action Surge', desc: ['Extra action'] };
    const mapper = new FeatureMapper();
    const mapped = mapper.map(mockFeature as any);
    expect(mapped.uid).toBe('api::feature.feature');
    expect(mapped.name).toBe('Action Surge');
  });
});



