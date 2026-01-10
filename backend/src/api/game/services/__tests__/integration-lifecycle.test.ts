import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupStrapi, cleanupStrapi } from '../../../../tests/setup-strapi';

describe('ActiveState Lifecycle Integration', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let strapi: any;

  beforeAll(async () => {
    strapi = await setupStrapi();
  });

  afterAll(async () => {
    await cleanupStrapi();
  });

  it('should auto-create ActiveState when EntitySheet is created', async () => {
    // 1. Create Effect
    const sheet = await strapi.entityService.create('api::entity-sheet.entity-sheet', {
      data: {
        name: 'Lifecycle Test Hero',
        type: 'player',
        maxHp: 10,
        hp: 10,
        level: 1,
        stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      },
    });

    // 2. Verify ActiveState exists
    const activeState = await strapi.db.query('api::active-state.active-state').findOne({
      where: { sheet: sheet.documentId },
      populate: ['attributes', 'skills'],
    });

    expect(activeState).toBeDefined();
    expect(activeState.currentHp).toBe(10);
    expect(activeState.sheet).toBeDefined();
    expect(activeState.skills.perception).toBeGreaterThanOrEqual(0);
  });

  it('should update ActiveState when EntitySheet is updated', async () => {
    // 1. Setup
    const sheet = await strapi.entityService.create('api::entity-sheet.entity-sheet', {
      data: {
        name: 'Update Test',
        level: 1,
        stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      },
    });

    // 2. Update Sheet (Str 10 -> 20)
    await strapi.entityService.update('api::entity-sheet.entity-sheet', sheet.documentId, {
      data: {
        stats: { strength: 20, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      },
    });

    // 3. Verify ActiveState
    const activeState = await strapi.db.query('api::active-state.active-state').findOne({
      where: { sheet: sheet.documentId },
      populate: ['skills'],
    });

    expect(activeState.attributes.strength).toBe(20);
    expect(activeState.skills.athletics).toBeGreaterThanOrEqual(5);
  });
});
