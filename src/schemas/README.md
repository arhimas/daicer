# Structured Output Schemas

Zod schemas defining the structured data contracts between the LLM services and the Daicer application. These schemas ensure that all AI-generated content (narratives, world building, combat outcomes) adheres to strict types before being processed by the game engine.

## Key Schemas

### `agent-responses.ts`

The primary collection of schemas for standard Game Master operations:

- **`TurnResponseSchema`**: The core narrative loop response, including player-specific perspectives.
- **`WorldDescriptionSchema`**: For procedural campaign generation (locations, threats, atmosphere).
- **`CombatNarrationSchema`**: Detailed blow-by-blow combat descriptions with outcomes.
- **`CharacterOpeningSchema`**: Initial context and hooks for new character introductions.

### `dm-turn.ts`

Specific schemas for the Dungeon Master's mechanical turn processing:

- **`DMTurnSchema`**: Combines narrative output with a list of mechanical `tool_calls`.
- **`ToolCallSchema`**: A standardized structure for the AI to invoke game engine tools (e.g., `roll_dice`, `apply_damage`).
