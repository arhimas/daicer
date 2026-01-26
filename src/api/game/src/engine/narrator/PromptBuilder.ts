import { WorldSettings } from '../types';
import { formatDmInstruction } from '../rules/narrator';

interface PromptContext {
    worldDescription: string;
    players: { name: string; hp?: number; maxHp?: number; armorClass?: number }[];
    entities: { name: string; type?: string; hp?: number; maxHp?: number; armorClass?: number; actions?: { name: string }[] }[];
    settings?: WorldSettings;
}

/**
 * Pure utility to constructing prompts for the Narrative Engine.
 */
export class PromptBuilder {
    /**
     * Builds the system prompt using a template.
     * @param context Data to inject
     * @param template Optional template string. If provided, uses {{placeholders}}. If not, uses default.
     */
    static buildSystemPrompt(context: PromptContext, template?: string): string {
        const playerSummaries = context.players.map(p => 
            `- ${p.name} | HP: ${p.hp}/${p.maxHp} | AC: ${p.armorClass}`
        ).join('\n');

        const creatureSummaries = context.entities
            .filter(e => e.type !== 'player')
            .map(c => 
                `- ${c.name} | HP: ${c.hp}/${c.maxHp} | AC: ${c.armorClass} | Actions: ${c.actions?.map(a => a.name).join(', ')}`
            ).join('\n');

        let dynamicStyleInstructions = 'Standard DM Style';
        if (context.settings?.dmStyle) {
             const instruction = formatDmInstruction(context.settings.dmStyle);
             dynamicStyleInstructions = `DYNAMIC STYLE ADJUSTMENTS:\n${instruction}`;
        }
        
        const worldLore = [context.settings?.worldBackground?.trim(), context.worldDescription]
            .filter(Boolean)
            .join('\n\n');

        // Variables for template
        const variables: Record<string, string> = {
            dmStyle: dynamicStyleInstructions,
            worldContext: worldLore,
            partyContext: playerSummaries,
            creaturesContext: creatureSummaries || 'None currently active.',
        };

        if (template) {
            // Simple replacement
            return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
                return variables[key] || `{{${key}}}`;
            });
        }

        // Fallback Default
        return `You are the Dungeon Master (DM) for a D&D 5e adventure.
Your goal is to run a thrilling, immersive, and fair game.

${dynamicStyleInstructions}

WORLD CONTEXT:
${worldLore}

CURRENT PARTY:
${playerSummaries}

ACTIVE CREATURES/NPCs:
${creatureSummaries || 'None currently active.'}

CRITICAL: TEAMWORK & PARTY COHESION:
- This is a TEAM adventure - the party works TOGETHER
- Create situations that require cooperation and reward working as a group

FORMATTING RULES - EXTREMELY IMPORTANT:
You MUST use rich markdown formatting in your narrative.`;
    }
}
