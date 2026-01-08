import { processCollection } from './enrichment-runner';
import { COLLECTION_MAP } from '../constants';
import { MonsterEnrichmentSchema } from '../schemas/index';
import { MONSTER_PROMPT_TEMPLATE } from './monsters/constants';
import { monsterHandler } from './monsters/logic';
import { getEnrichmentContext } from '../context';

export const runMonsters = async (limit: number, isDryRun: boolean) => {
  const context = await getEnrichmentContext();

  const hydratedTemplate = MONSTER_PROMPT_TEMPLATE.replace('{{KNOWN_SPELLS}}', context.spells.join(', ')).replace(
    '{{KNOWN_EQUIPMENT}}',
    context.equipment.join(', ')
  );

  await processCollection({
    uid: COLLECTION_MAP.monsters,
    schema: MonsterEnrichmentSchema,
    promptTemplate: hydratedTemplate,
    limit,
    isDryRun,
    handler: monsterHandler,
  });
};
