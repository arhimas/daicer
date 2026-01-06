# 🎲 Daicer Backend CLI

<p align="center">
  <img src="https://media.giphy.com/media/l41lFw057lAJQM50I/giphy.gif" width="100%" alt="Matrix Data" />
</p>

> **"The lens through which the Agent perceives the World."**

The **Daicer CLI** (`daicer-cli`) is a high-performance, terminal-native interface for the Daicer backend. It bridges the gap between the headless Strapi architecture and the developer (human or machine), providing instantaneous access to the raw data layer without the overhead of a web browser or the opacity of the database.

---

## 📖 Table of Contents

- [Philosophy](#-philosophy)
- [Installation & Setup](#-installation--setup)
- [Core Workflows](#-core-workflows)
  - [Interactive Mode (Human)](#interactive-mode-human)
  - [Agent Mode (LLM)](#agent-mode-llm) ✨ **SOTA**
- [Advanced Usage](#-advanced-usage)
  - [The Schema-First Strategy](#the-schema-first-strategy)
  - [Power Filtering](#power-filtering)
- [Command Reference](#-command-reference)

---

## 🧠 Philosophy

Daicer is built on a **Server-Authoritative** architecture. The backend contains the source of truth for the simulation—State, Rules, and Content.

Traditional workflows force you to open the Strapi Admin Panel to view this truth. This is slow, click-heavy, and impossible for an AI Agent to navigate effectively.

**The CLI solves this by treating the Database as a Filesystem.**

- **Transparency**: See exactly what the API returns, not a sanitized UI representation.
- **Velocity**: Query content in milliseconds with zero context switching.
- **Agent-Native**: First-class support for LLM interactions via strictly typed JSON outputs.

---

## 📦 Installation & Setup

The CLI lives inside the `@daicer/backend` workspace. It requires no global installation.

### Prerequisites

1.  **Backend Must Be Running**: The CLI communicates with your local Strapi instance via HTTP.
    ```bash
    yarn develop
    ```
2.  **Environment Variables**: Ensure your `.env` contains a valid `STRAPI_AUDIT_TOKEN` if you have locked down your API.

---

## ⚡ Core Workflows

### Interactive Mode (Human)

Designed for the developer who needs to "look around".

```bash
yarn cli explore
```

1.  **Select Entity**: The CLI automatically scans your `src/api` folder. Just type "monster" or "game" to filter the dropdown.
2.  **Choose Action**: `Find All`, `Find One`, or `Count`.
3.  **Visual Feedback**: Results are printed with syntax highlighting.
4.  **Save**: You will be prompted to save the result to a JSON file.

### Agent Mode (LLM)

**"How should I use this?" — The AI Agent**

If you are an LLM (Claude, Gemini, etc.), **DO NOT** use the interactive mode. Instead, use the **Stateless Command Line Arguments**.

#### The Golden Rule

> **ALWAYS** use `--json` when acting as an Agent. It ensures the output is pure, parsable JSON with no ANSI color codes or spinners.

---

## 🚀 Advanced Usage

### The Schema-First Strategy

This is the **clever** way to operate. Instead of guessing fields, **inspect the schema first**.

1.  **Introspect**: Get the full schema definition to understand available fields and relations.
    ```bash
    yarn cli schema --type api::monster.monster
    ```
2.  **Plan Filter**: Use the schema knowledge to construct a precise filter.
    ```bash
    # "Ah, the schema says 'is_template' is a boolean, not a string."
    yarn cli explore --type api::monster.monster --filters '{"is_template": true}' --json
    ```
3.  **Execute**: Retrieve the data with full confidence.

### Power Filtering

The `--filters` flag accepts a raw JSON string that maps directly to Strapi's entity service filters.

**Example: Find all "Goblin" monsters that are Templates**

```bash
yarn cli explore \
  --type api::monster.monster \
  --filters '{"name": {"$contains": "Goblin"}, "is_template": true}' \
  --json
```

**Example: Find items with value > 100**

```bash
yarn cli explore \
  --type api::item.item \
  --filters '{"value": {"$gt": 100}}' \
  --json
```

---

## 📚 Command Reference

### `schema`

Inspect the structural definition of your content types.

| Flag            | Description                                    |
| :-------------- | :--------------------------------------------- |
| `--list`        | List all available Content Types UIDs.         |
| `--all`         | Dump ALL schemas as a single JSON map (heavy). |
| `--type <uid>`  | Dump schema for a specific type.               |
| `--save <path>` | Save output to file.                           |

### `explore`

Query the actual data in the database.

| Flag                | Description                                              | Default |
| :------------------ | :------------------------------------------------------- | :------ |
| `-t, --type <uid>`  | Strapi UID (e.g. `api::game.game`).                      | `null`  |
| `-a, --action <op>` | `find`, `findOne`, `count`.                              | `find`  |
| `--filters <json>`  | JSON string for filtering (e.g. `'{"field": "value"}'`). | `null`  |
| `-l, --limit <num>` | Results limit.                                           | `50`    |
| `--json`            | **Critical**. Disables interactive mode.                 | `false` |
| `--save <path>`     | Save output to file.                                     | `null`  |

---

## 🛠 Troubleshooting

### `fetch failed` / `ECONNREFUSED`

**Fix**: Open a new terminal tab and run `yarn develop` in `backend`.

### `Forbidden` / `403`

**Fix**: Check `backend/.env`. Ensure `STRAPI_AUDIT_TOKEN` matches a token in Strapi Admin with proper permissions.

### `Type not found`

**Fix**: Double check the UID syntax. Use `yarn cli schema --list` to find the correct UID.
