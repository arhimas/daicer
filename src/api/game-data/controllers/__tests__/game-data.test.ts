import { describe, it, expect, vi, beforeEach } from 'vitest';
import gameDataControllerFactory from '../game-data';

describe('Game Data Controller', () => {
  let ctx: any;
  const controller = gameDataControllerFactory();

  beforeEach(() => {
    ctx = {
      params: {},
      body: null,
    };
  });

  it('should return a valid template for a known archetype', async () => {
    ctx.params = { archetype: 'fighter' };
    await controller.getTemplate(ctx);

    expect(ctx.body).toBeDefined();
    expect(ctx.body.success).toBe(true);
    expect(ctx.body.data).toBeDefined();
    expect(ctx.body.data.characterClass).toBe('Fighter');
    expect(ctx.body.data.name).toBe('Valen Heritage');
  });

  it('should return a fallback template for an unknown archetype', async () => {
    ctx.params = { archetype: 'unknown-class' };
    await controller.getTemplate(ctx);

    expect(ctx.body).toBeDefined();
    expect(ctx.body.success).toBe(true);
    expect(ctx.body.data).toBeDefined();
    expect(ctx.body.data.characterClass).toBe('Unknown-class');
    expect(ctx.body.data.backstory).toContain('A novice unknown-class');
  });

  it('should handle undefined archetype gracefully', async () => {
    ctx.params = {};
    await controller.getTemplate(ctx);

    expect(ctx.body).toBeDefined();
    expect(ctx.body.success).toBe(true);
    // Should fallback to 'Undefined' class name or similar, based on implementation
    expect(ctx.body.data.characterClass).toBeDefined();
  });

  it('should handle case insensitivity', async () => {
    ctx.params = { archetype: 'WiZaRd' };
    await controller.getTemplate(ctx);

    expect(ctx.body.data.characterClass).toBe('Wizard');
    expect(ctx.body.data.name).toBe('Elara Moonwhisper');
  });
});
