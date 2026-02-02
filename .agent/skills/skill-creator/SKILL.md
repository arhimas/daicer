---
name: skill-creator
description: Meta-skill that teaches the Agent how to create NEW skills correctly.
---

# Skill Creator Skill

Use this skill when the user asks you to "create a skill" or "learn a new capability".

## 🏗️ Recipe: The Perfect Skill

To create a new skill named `<skill-name>`:

1.  **Create Directory**: `mkdir -p .agent/skills/<skill-name>/references`
2.  **Create SKILL.md**: Write `.agent/skills/<skill-name>/SKILL.md` with YAML frontmatter.
    ```markdown
    ---
    name: <skill-name>
    description: <short-description>
    ---
    
    # <Human Readable Name>
    
    <Instructions on WHEN and HOW to use this skill>
    
    ## References
    - [Ref 1](references/ref-1.txt)
    ```
3.  **Migrate Knowledge**: Move huge text blobs into `.agent/skills/<skill-name>/references/`.
    *   *Rule*: `SKILL.md` should be lightweight (instructions only). Heavy data goes in `references/`.
4.  **Register**: Add the skill to `.agent/skills/project-context/references/llms.txt`.

## 🚨 Anti-Patterns
*   **No "Dumping"**: Do not just paste 100kb of text into `SKILL.md`. Use `references/`.
*   **No Binaries**: Do not store images/PDFs in `references/`. Text only.
