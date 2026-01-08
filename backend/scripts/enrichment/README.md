# 🎲 Daicer Enrichment Engine

> **State of the Art (SOTA) Data Enrichment Pipeline for D&D 5e.**
> Powered by pure JSON-native LLM extraction, validated by Zod, and strictly typed for Strapi v5.

## 🚀 Quick Start

Ensure your backend is running (`yarn develop` or `yarn start`) on port `1337`.

```bash
# 1. Ingest/Update Classes from Markdown (classes.md)
yarn tsx backend/scripts/enrichment/ingest-classes.ts

# 2. Enrich ALL Spells (normalize fields, add metadata)
yarn tsx backend/scripts/enrichment/enrich-game-data.ts --target=spells

# 3. Enrich ALL Monsters (parse actions, add tags)
yarn tsx backend/scripts/enrichment/enrich-game-data.ts --target=monsters

# Optionals
yarn tsx backend/scripts/enrichment/enrich-game-data.ts --target=equipment
yarn tsx backend/scripts/enrichment/enrich-game-data.ts --target=magic-items
```

---

## 🏗 Architecture

The enrichment engine is modularized to ensure maintainability and strict separation of concerns.

```text
backend/scripts/enrichment/
├── enrich-game-data.ts    # Main Entry Point (CLI Orchestrator)
├── ingest-classes.ts      # Dedicated Ingestion for Class Markdown
├── modules/
│   ├── config.ts          # Shared Configuration
│   ├── constants.ts       # Collection UIDs, global settings
│   ├── llm.ts             # Gemini 1.5/3.0 Factory with Robust JSON Repair
│   ├── schemas.ts         # Zod definitions matching Strapi Components
│   └── processors/        # Entity-specific logic
│       ├── base-processor.ts # The "Engine" (Queue, LLM Loop, Retry)
│       ├── spells.ts         # Spell-specific prompts & handling
│       ├── monsters.ts       # Monster-specific prompts & handling
│       ├── classes.ts        # Class-specific prompts & handling
│       └── items.ts          # Items/Equipment logic
```

## 📜 Strict Schema Compliance

We use **Zod Schemas** that mirror Strapi's internal Components exactly to prevent `400 Bad Request` errors.

### Critical Enums (Case Sensitive!)

If you see validation errors, check these values in your data/LLM output:

**Magic Schools** (`school`):

- `Abjuration`, `Conjuration`, `Divination`, `Enchantment`, `Evocation`, `Illusion`, `Necromancy`, `Transmutation`.

**Damage Types** (`damage_type`):

- `Acid`, `Bludgeoning`, `Cold`, `Fire`, `Force`, `Lightning`, `Necrotic`, `Piercing`, `Poison`, `Psychic`, `Radiant`, `Slashing`, `Thunder`.

**Casting Time Units** (`time_unit`):

- `Action`, `Bonus Action`, `Reaction`, `Minute`, `Hour`, `Day`, `Round`.

**AOE Shapes** (`aoe_shape`):

- `Cone`, `Cube`, `Cylinder`, `Line`, `Sphere`, `Hemisphere`.

### Components

The system maps data into these Strapi Components:

- `game.casting-config` (Time, Ritual, Concentration)
- `game.range-config` (Distances, AOE)
- `game.damage-instance` (Dice count, value, type)
- `game.feature` (Actions, traits)

## 🛠 Debugging

If the script fails with `400 Bad Request`:

1.  **Check the logs**: The script prints the error message from Strapi.
2.  **Use `debug_schema.ts`**: We've included a standalone script to test a _valid hardcoded payload_ against your specific Strapi instance.

    ```bash
    yarn tsx backend/scripts/enrichment/debug_schema.ts
    ```

    If this fails, your Strapi Schema (`backend/src/api/**/schema.json`) is out of sync with what the script expects. Restart Strapi (`yarn develop`) to apply schema changes.

3.  **Dry Run**: Use `--dry-run` to see what the LLM _would_ write without hitting the DB.
    ```bash
    yarn tsx backend/scripts/enrichment/enrich-game-data.ts --target=spells --limit=1 --dry-run
    ```

## 🧠 LLM Integration

Powered by **Gemini**. The system uses a "Native Structured Output" first approach, falling back to "Raw JSON + `jsonrepair`" if the model refuses.

- **Files**: `modules/llm.ts` handles the client.
- **Prompts**: Located in `modules/processors/*.ts`.
