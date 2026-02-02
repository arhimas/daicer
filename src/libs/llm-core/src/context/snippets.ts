/**
 * Hardcoded snippets and legends for AI Prompt Generation.
 * @see file:///Users/lg/lab/daicer/src/plugins/map-explorer/server/src/services/gemini-service.ts
 */

export const SNIPPETS = {
  VISION_INSTRUCTION_PREFIX:
    'Analyze the visual blueprint provided. The colored zones indicate semantic meaning (see system instructions).',

  SHALLOW_CONTEXT_HEADER: 'ENTITY CONTEXT (Draft/Shallow):',

  SHALLOW_DATA_FALLBACK: '(No additional form data provided)',

  IGNORED_SHALLOW_KEYS: [
    'password',
    'confirmation',
    'createdBy',
    'updatedBy',
    'createdAt',
    'updatedAt',
    'publishedAt',
    'localizations',
    'locale',
  ],

  // Specific to blueprint-architect
  STRICT_LEGEND_HEADER: 'CRITICAL: You must ONLY use the symbols listed in the Legend above.',

  // Specific to Conflict Resolution
  PROMPT_OVERRIDE_WARNING: (prompt: string) =>
    `\n\n[IMPORTANT OVERRIDE]: The user has provided a specific generation prompt: "${prompt}".\n` +
    `If this prompt conflicts with the JSON DATA above, you MUST prioritize the PROMPT for visual appearance.`,
};
