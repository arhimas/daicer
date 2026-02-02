---
name: dnd-rules
description: Domain expert on Dungeons & Dragons 5e Rules (SRD).
---

# D&D Rules Skill

Use this skill when the user asks about Game Rules, Spells, Classes, Races, or Mechanics.

## Instructions

The full D&D 5e System Reference Document (SRD) is available in your Knowledge Base.

### 1. Consult the SRD
*   **Source**: `references/dnd-5e-srd.md`
*   **Action**: Use `view_file` or `grep_search` on this file to find specific rules.

### 2. Accuracy Mandate
*   **Do not guess**. D&D players are particular about rules. Quote the SRD text where possible.
*   **Formatting**: When presenting stat blocks or tables, use standard markdown tables.

### 3. Common Queries
*   "What are the stats for a Goblin?" -> Search `dnd_5e_srd.md` for `## Goblin`.
*   "How does Grappling work?" -> Search `dnd_5e_srd.md` for `Grappling`.
*   "List all level 3 spells" -> Search `dnd_5e_srd.md` for spell lists.
