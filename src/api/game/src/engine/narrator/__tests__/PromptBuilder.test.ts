import { describe, it, expect } from 'vitest';
import { PromptBuilder } from '../PromptBuilder';

describe('PromptBuilder', () => {
  const mockContext = {
    worldDescription: 'A dark and stormy night.',
    players: [
      { name: 'Hero', hp: 10, maxHp: 10, armorClass: 15 }
    ],
    entities: [
      { name: 'Goblin', type: 'enemy', hp: 5, maxHp: 7, armorClass: 12, actions: [{ name: 'Stab' }] },
      { name: 'Villager', type: 'npc', hp: 4, maxHp: 4 } // No actions
    ],
    settings: {
      dmStyle: 'Gritty',
      worldBackground: 'The land of Ooo.'
    } as any
  };

  it('should build prompt using default template', () => {
    const prompt = PromptBuilder.buildSystemPrompt(mockContext);
    
    expect(prompt).toContain('You are the Dungeon Master');
    expect(prompt).toContain('Hero | HP: 10/10');
    expect(prompt).toContain('Goblin | HP: 5/7');
    expect(prompt).toContain('DYNAMIC STYLE'); // Gritty -> dynamic logic
    expect(prompt).toContain('The land of Ooo.'); // World background
  });

  it('should handle missing entities gracefully', () => {
    const context = {
        worldDescription: '',
        players: [],
        entities: []
    };
    const prompt = PromptBuilder.buildSystemPrompt(context);
    expect(prompt).toContain('None currently active.');
  });

  it('should support custom templates', () => {
    const template = "Welcome to {{worldContext}}. Players: {{partyContext}}.";
    const prompt = PromptBuilder.buildSystemPrompt(mockContext, template);
    
    expect(prompt).toContain('Welcome to The land of Ooo.');
    expect(prompt).toContain('Players: - Hero');
    expect(prompt).not.toContain('You are the Dungeon Master'); // Default overridden
  });
});
