/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { generateStructured } from '../../../utils/llm/structured';
import { getPrompt, formatPrompt } from '../../../utils/prompt';
import { formatDmInstruction } from '../src/engine';
// import { getStrapiClient } from '../../../utils/strapi-client'; // Assuming utility location or use strapi global
// import { EngineEntity } from './entity-adapter'; // Removed
import type { Player, WorldSettings, Language, Entity } from '../src/engine';
// Local definition
interface Message {
  sender: string;
  text: string;
}

export default ({ strapi }) => ({
  /**
   * Generates the narrative response for a game turn using the LLM.
   * Aggregates context from players, world state, and chat history.
   *
   * @param roomId - The room context.
   * @param worldDescription - The static description of the world.
   * @param messages - Recent chat history.
   * @param players - Active players.
   * @param entities - All entities in the scene.
   * @param language - Output language.
   * @param settings - World/DM settings.
   * @param mapImage - Optional visual context for the LLM.
   * @returns Structured Turn Response (Summary + Perspectives).
   */
  async generateNarrativeResponse(
    roomId: string,
    worldDescription: string,
    messages: Message[],
    players: Player[],
    entities: Entity[],
    language: Language = 'en',
    settings?: WorldSettings,
    worldConditions?: {
      id: string;
      name: string;
      description?: string;
      effect?: string;
    }[],

    streamId?: string,
    mapImage?: Buffer
  ) {
    const { TurnResponseSchema } = await import('../../../schemas/agent-responses');
    const { PromptBuilder } = await import('../src/engine/narrator/PromptBuilder');

    const languageMap: Record<Language, string> = {
      en: 'English',
      es: 'Spanish',
      'pt-BR': 'Brazilian Portuguese',
    };
    const languageName = languageMap[language] || 'English';

    // 1. Fetch Template
    const systemPromptTemplate = await getPrompt('dm_system_instruction', language, ''); // Empty defaults to Builder's internal default if passed as undefined? 
    // Builder logic: if template string provided, it uses it. If '', it assumes it's a template of empty string.
    // We should pass undefined if empty to trigger default.
    const validTemplate = systemPromptTemplate || undefined;

    // 2. Build Context
    const context = {
        worldDescription,
        players: players.map(p => ({
            name: p.character?.name || 'Unknown',
            hp: p.character?.currentHp,
            maxHp: p.character?.maxHp,
            armorClass: Number(p.character?.ac || 10)
        })),
        entities: entities.filter(e => e.type !== 'player').map(e => ({
            name: e.name,
            type: e.type,
            hp: e.hp,
            maxHp: e.maxHp,
            armorClass: e.armorClass,
            actions: e.actions
        })),
        settings
    };

    // 3. Construct System Prompt
    const systemPrompt = PromptBuilder.buildSystemPrompt(context, validTemplate);

    // 4. Construct Full Prompt (User/Turn Context)
    const conversationHistory = messages.map((msg) => `${msg.sender}: ${msg.text}`).join('\n\n');
    const currentActions = players
      .filter((p) => p.action && p.character)
      .map((p) => `${p.character!.name}: ${p.action}`)
      .join('\n');

    const fullPrompt = `${systemPrompt}

You MUST respond with a structured JSON object containing:
- overall_summary (string): An overall summary
- player_perspectives (array): Personalized perspectives

PREVIOUS STORY:
${conversationHistory}


CURRENT TURN ACTIONS:
${currentActions}

As the Dungeon Master, narrate what happens. First, provide an 'overall_summary'. Then, provide 'player_perspectives'.
Respond entirely in ${languageName}.
${mapImage ? '\n[Image Attached]' : ''}`;

    strapi.log.info('Processing turn with LLM');

    return generateStructured(TurnResponseSchema, systemPrompt, fullPrompt, language, {
      metadata: { streamId },
      images: mapImage ? [mapImage] : undefined,
    });
  },
});

