import { PromptBuilder } from '../PromptBuilder';

describe('PromptBuilder', () => {
    const mockContext = {
        worldDescription: 'A dark cave.',
        players: [{ name: 'Hero', hp: 10, maxHp: 10, armorClass: 15 }],
        entities: [{ name: 'Goblin', type: 'monster', hp: 7, maxHp: 7, armorClass: 12, actions: [{ name: 'Stab' }] }],
        settings: { dmStyle: { verbosity: 0, detail: 0, engagement: 0, narrative: 0 } } as any
    };

    it('constructs basic system prompt logic (Default)', () => {
        const prompt = PromptBuilder.buildSystemPrompt(mockContext);
        
        expect(prompt).toContain('You are the Dungeon Master');
        expect(prompt).toContain('A dark cave');
        expect(prompt).toContain('Hero | HP: 10/10');
        expect(prompt).toContain('Goblin | HP: 7/7');
    });

    it('injects variables into template', () => {
        const template = 'Hello {{partyContext}} welcome to {{worldContext}}';
        const prompt = PromptBuilder.buildSystemPrompt(mockContext, template);
        
        expect(prompt).toContain('Hero | HP: 10/10');
        expect(prompt).toContain('A dark cave');
        expect(prompt).not.toContain('You are the Dungeon Master'); // Should not have default text
    });

    it('handles missing variables in template gracefully', () => {
        const template = 'Hello {{unknownVar}}';
        const prompt = PromptBuilder.buildSystemPrompt(mockContext, template);
        expect(prompt).toBe('Hello {{unknownVar}}');
    });
});
