---
name: daicer-cli
description: API for the Agent to interact with the Daicer Backend via CLI.
---

# Daicer CLI Skill

**"You are blind without the CLI."**

This skill provides the primary interface for the Agent to perceive the backend state, inspect schemas, and query the knowledge base.

## 📁 Reference Library

Full command usage is available in the `references/` directory:

- [Main Help](references/cli-main-help.txt)
- [Explore Command](references/cli-explore-help.txt)
- [Compile Command](references/cli-compile-help.txt)
- [Genesis Command](references/cli-genesis-help.txt)
- [Embed Command](references/cli-embed-help.txt)
- [Logs Command](references/cli-logs-help.txt)

## 🛠️ Usage Patterns

### 1. 📡 System Status

**Check if the backend is alive.**

```bash
yarn cli status --json
```

### 2. 🔮 Deep Schema Inspection

**Understand the shape of data before writing queries.**
Use this instead of guessing field names.

```bash
# Get schema for a specific content type
yarn cli schema --type "api::spell.spell" --json

# List all available Schemas
yarn cli schema --list --json
```

### 3. 🔍 Data Exploration (Agentic Mode)

**Fetch actual database content.**
ALWAYS use `--json` so you receive machine-readable output.

```bash
# Find 5 spells
yarn cli explore \
  --type "api::spell.spell" \
  --action find \
  --limit 5 \
  --json

# Find a specific entity by Document ID
yarn cli explore \
  --type "api::monster.monster" \
  --action findOne \
  --document-id "doc_12345" \
  --json

# Filter search (JSON string required for filters)
yarn cli explore \
  --type "api::item.item" \
  --action find \
  --filters '{"rarity": "Legendary"}' \
  --json
```

### 4. 🧠 Knowledge Retrieval (RAG)

**Search the Vector Database.**
Use this to answer questions about Game Rules, Code Context, or Lore.

```bash
yarn cli knowledge --query "How does the Entropy system work?" --json
```

### 5. ⚡ Compilation & Validation

**Trigger logic pipelines for specific entities.**
Useful for debugging why an entity isn't updating.

```bash
# Re-compile a specific spell
yarn cli compile \
  --target "api::spell.spell" \
  --id "doc_123" \
  --phase "Atom" \
  --json
```

### 6. 🌱 Genesis & Seeding

**Reset or Hydrate the world.**

> ⚠️ **CAUTION**: Genesis actions can be destructive.

```bash
# Seed all Atoms (Basic definitions)
yarn cli genesis atoms --json

# Seed everything
yarn cli genesis all --json
```

### 7. 🚀 System Instantiation

**Standard "Boot Up" Sequence.**
Run this when the user says `@instantiate` or "Get ready".

```bash
# 1. Connect
yarn cli status --json

# 2. Map Territory
yarn cli schema --list --json

# 3. Load Context (if needed)
yarn cli knowledge --query "Project architecture and recent decisions" --json
```

## 🚨 Troubleshooting

| Error               | Cause                       | Fix                                                        |
| :------------------ | :-------------------------- | :--------------------------------------------------------- |
| `ConnectionRefused` | Backend is down.            | Run `yarn start` or check logs.                            |
| `UID Not Found`     | Wrong Content Type UID.     | Run `yarn cli schema --list` to find the correct UID.      |
| `JSON Parse Error`  | CLI output mixed with logs. | Ensure `--json` is passed and `LOG_LEVEL=error` if needed. |
