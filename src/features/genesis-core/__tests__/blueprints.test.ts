import { describe, it, expect } from 'vitest';
import { createSolidTexture, defineEntity, defineAction, defineItem, defineSpell, defineFeature, defineTrait, defineClass, defineSubclass, defineRace, defineDamageType, defineStatusEffect, defineMagicSchool, defineBackground, defineWeaponProperty, defineTerrain } from '@/features/genesis-core/blueprints';

describe('Genesis Core Blueprints - createSolidTexture', () => {
  it('should generate a 32x32 array of voxels with the specified payload', () => {
    const color = '#FF0000';
    const texture = createSolidTexture(color);

    expect(texture).toBeDefined();
    expect(texture.length).toBe(32 * 32);

    // Check first item
    expect(texture[0]).toEqual({
      x: 0,
      y: 0,
      z: 0,
      type: color, // The current logic sets 'type' to the hex value directly
    });

    // Check last item
    expect(texture[1023]).toEqual({
      x: 31,
      y: 31,
      z: 0,
      type: color,
    });
  });
});

describe('Genesis Core Blueprints - define* Helpers', () => {
  it('should return the input data unmodified for all define functions', () => {
    const mockData = { name: 'Test', slug: 'test' } as any;

    expect(defineEntity(mockData)).toEqual(mockData);
    expect(defineAction(mockData)).toEqual(mockData);
    expect(defineItem(mockData)).toEqual(mockData);
    expect(defineSpell(mockData)).toEqual(mockData);
    expect(defineFeature(mockData)).toEqual(mockData);
    expect(defineTrait(mockData)).toEqual(mockData);
    expect(defineClass(mockData)).toEqual(mockData);
    expect(defineSubclass(mockData)).toEqual(mockData);
    expect(defineRace(mockData)).toEqual(mockData);
    expect(defineDamageType(mockData)).toEqual(mockData);
    expect(defineStatusEffect(mockData)).toEqual(mockData);
    expect(defineMagicSchool(mockData)).toEqual(mockData);
    expect(defineBackground(mockData)).toEqual(mockData);
    expect(defineWeaponProperty(mockData)).toEqual(mockData);
    expect(defineTerrain(mockData)).toEqual(mockData);
  });
});
