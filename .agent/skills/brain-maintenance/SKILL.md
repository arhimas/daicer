---
name: brain-maintenance
description: Tools for maintaining and indexing the Agent Brain (.agent/knowledge).
---

# Brain Maintenance Skill

Use this skill to update the `llms.txt` index or organize knowledge when new documentation is added.

## Instructions

### 1. Update Index (`llms.txt`)
When new files are added to `.agent/knowledge`, run this sequence to update the index.

1.  **List Knowledge**: Run `list_dir .agent/knowledge` (recursive).
2.  **Generate Entry**: Format the new file as `- [Title](relative/path/to/file): Description.`.
3.  **Append**: Use `replace_file_content` to add it to `.agent/knowledge/llms.txt` under the appropriate section.

### 2. Knowledge Ingestion
When the user asks to "learn" a new doc:
1.  **Categorize**: Decide if it's `domain`, `backend`, `ai`, or `architecture`.
2.  **Move**: Move the file to the correct subfolder in `.agent/knowledge/`.
3.  **Index**: Update `llms.txt`.

### 3. Decisions Log
When a major architectural decision is made:
1.  **Log**: Append a new entry to `.agent/memory/decisions.md` with Date, Decision, and Rationale.
