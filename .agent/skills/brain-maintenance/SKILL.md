---
name: brain-maintenance
description: Tools for maintaining and indexing the Agent Brain (.agent/knowledge).
---

# Brain Maintenance Skill

Use this skill to update the `llms.txt` index or organize knowledge when new documentation is added.

## Instructions

### 1. Update Index (`llms.txt`)
When new files are added to any Skill's `references/` directory, run this sequence to update the index.

1.  **List Skills**: Run `find_by_name` for `references` inside `.agent/skills`.
2.  **Generate Entry**: Format the new file as `- [Title](../skills/<SkillName>/references/<File>): Description.`.
3.  **Append**: Use `replace_file_content` to add it to `.agent/skills/project-context/references/llms.txt`.

### 2. Knowledge Ingestion
When the user asks to "learn" a new doc:
1.  **Categorize**: Select the most appropriate Skill (e.g., `ai-engineering`, `system-architecture`).
2.  **Move**: Move the file to `references/` within that Skill.
3.  **Index**: Update `llms.txt`.

### 3. Decisions Log
When a major architectural decision is made:
1.  **Log**: Append a new entry to `.agent/skills/project-context/references/decisions.md` with Date, Decision, and Rationale.
