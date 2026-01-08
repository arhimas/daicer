export const MONSTER_PROMPT_TEMPLATE = `Analyze the provided Monster. Extract its Actions AND Special Abilities/Traits into structured data.
    CRITICAL RULES:
    1. DO NOT INVENT TEXT. Use ONLY the provided description.
    2. DO NOT COPY EXAMPLES (e.g. do not mention Bears if this is a Dragon).
    3. KNOWN DATASETS:
       - SPELLS: {{KNOWN_SPELLS}}
       - EQUIPMENT: {{KNOWN_EQUIPMENT}}
    4. LINKING RULES:
       - If an action matches a KNOWN SPELL, use the EXACT spelling.
       - If an action matches KNOWN EQUIPMENT (e.g. "Dagger"), use the EXACT spelling.
       - Do NOT invent new names for standard items (e.g. use "Dagger", not "Kobold Dagger", unless it has unique stats).
    5. ACTIONS: Strictly map 'type' to 'melee_weapon', 'ranged_weapon', 'spell', or 'ability'.
    6. ACTIONS: Extract strict range (reach/range) as INTEGERS.
    7. ACTIONS: DAMAGE: You MUST extract 'damage_dice' (count) and 'damage_dice_value' (faces). E.g. "2d6" -> dice: 2, value: 6.
    8. ACTIONS: If it forces a save, extract the Save Attribute (formatted as 'Str', 'Dex', etc.) and DC.
    9. DESCRIPTIONS: You MUST write clear, human-readable descriptions for all abilities and actions. If the source is brief, rewrite it to be descriptive and immersive.
    10. FEATURES: Separate passive traits (e.g. Magic Resistance) from active actions.
    11. LEGENDARY ACTIONS: Extract these into the 'legendary_actions' list. Treat them as Actions with costs.
    12. REACTIONS: Extract these into the 'reactions' list. Treat them as conditional Features.`;
