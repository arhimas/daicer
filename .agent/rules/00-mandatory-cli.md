---
trigger: always_on
---

# 🛑 00. The Prime Directive: CLI Usage

> [!CRITICAL]
> **YOU ARE BLIND WITHOUT THE CLI.**
> You are **FORBIDDEN** from guessing database schemas.
> You are **FORBIDDEN** from hallucinating game rules.
> You **MUST** use the CLI to perceive the world.

## 1. The "Know-How" Loop

Before writing a single line of code, you must execute this loop:

1.  **📡 Status**: Check connection.
    `yarn cli status --json`
2.  **🔮 Schema (Deep)**: Get the _exact_ shape of data (including nested components).
    `yarn cli schema --type <uid> --json`
3.  **🔍 Explore (Data)**: Fetch actual database content to verify assumptions.
    `yarn cli explore --type <uid> --action find --filters '...' --json`
4.  **🧠 Knowledge (RAG)**: Retrieve Game Rules, Lore, and Code Context.
    `yarn cli knowledge --query "<concept>" --json`

## 2. The Knowledge Command (RAG)

The `knowledge` command is your access to the Vector Database. It searches:

1.  **Entities** (Monsters, Spells, Items in the DB).
2.  **Source Code** (Functions, Classes).
3.  **Markdown Manuals** (The `README.md` files).

**Usage:**

```bash
yarn cli knowledge --query "How does the Entropy system work?" --json
```
