# 🎲 Daicer Backend CLI

```text
.    .    .    .    .    .    .    .    .    .    .    .
   _____       _                    _____ _      _____
  |  __ \     (_)                  / ____| |    |_   _|
  | |  | | __ _ _  ___ ___ _ __   | |    | |      | |
  | |  | |/ _` | |/ __/ _ \ '__|  | |    | |      | |
  | |__| | (_| | | (_|  __/ |     | |____| |____ _| |_
  |_____/ \__,_|_|\___\___|_|      \_____|______|_____|

.    .    .    .    .    .    .    .    .    .    .    .
```

> **"The Lens through which the Agent perceives the World."**

The **Daicer CLI** is the _definitive_ interface for interacting with the Daicer Backend. It provides a shared reality for both Human Developers and AI Agents, ensuring that **Truth** is always accessible, typed, and verifiable.

---

## ⚡ Quick Start

**1. Ensure Backend is Running**
You cannot use the CLI if the simulation is paused.

```bash
yarn develop
```

**2. Launch Interactive Mode (Humans)**

```bash
yarn cli
```

_Navigates you through the Matrix._

---

## 🤖 The Agent Protocol (LLM Users)

**If you are an AI Agent (Claude, Gemini, GPT), READ THIS.**

You are **prohibited** from guessing database schemas. You are **prohibited** from hallucinating game rules. You MUST use this CLI to ground yourself in reality.

### The Golden Workflow

1.  **📡 Check Pulse**: Is the server online?
    ```bash
    yarn cli status --json
    ```
2.  **🔮 Inspect Reality**: What does the data structure look like?
    ```bash
    yarn cli schema --type api::monster.monster --json
    ```
3.  **💪 Query with Precision**: Fetch exactly what you need.
    ```bash
    yarn cli explore --type api::monster.monster --filters '{"challenge_rating": { "$gt": 5 }}' --json
    ```
4.  **🧠 Consult Knowledge**: Verify rules via RAG.
    ```bash
    yarn cli knowledge --query "How does Legendary Resistance work?" --json
    ```

---

## 📚 Command Reference

### `🔍 explore`

_The Data Query Engine._

| Flag                 | Description                                   | usage                              |
| :------------------- | :-------------------------------------------- | :--------------------------------- |
| `--type <uid>`       | **Required**. The Collection/Single Type UID. | `api::spell.spell`                 |
| `--action <op>`      | `find` (default), `findOne`, `count`.         | `--action count`                   |
| `--filters <json>`   | MongoDB-style filter object.                  | `--filters '{"name": "Fireball"}'` |
| `--document-id <id>` | Required for `findOne`.                       | `--document-id abc...`             |
| `--json`             | **STRICT MODE**. Returns pure JSON.           | `--json`                           |

**Examples:**

```bash
# Find all Level 3 Spells
yarn cli explore -t api::spell.spell --filters '{"level": 3}' --json

# Get details of a specific character
yarn cli explore -t api::character.character --action findOne --document-id <docId> --json
```

### `🧠 knowledge`

_The RAG (Retrieval-Augmented Generation) Interface._

| Flag               | Description                                    | usage                      |
| :----------------- | :--------------------------------------------- | :------------------------- |
| `--query <text>`   | The semantic question to ask.                  | `--query "Goblin tactics"` |
| `--json`           | **STRICT MODE**. Returns scored JSON array.    | `--json`                   |
| `--entities`       | Search ONLY Entity records (Monsters, Spells). | `--entities`               |
| `--targets <list>` | Search specific scopes.                        | `--targets spell,manual`   |

**Examples:**

```bash
# General Rule Lookup
yarn cli knowledge -q "Grappling rules" --json

# Find a Monster by rough description
yarn cli knowledge -q "Large fire breathing lizard" --targets monster --json
```

### `🔮 schema`

_The Structure Inspector._
_Never assume a field name. Always check._

| Flag           | Description                            |
| :------------- | :------------------------------------- |
| `--type <uid>` | The UID to inspect.                    |
| `--list`       | List ALL available UIDs in the system. |
| `--json`       | **STRICT MODE**. Returns Schema JSON.  |

**Examples:**

```bash
# "What fields does a Weapon have?"
yarn cli schema -t api::item.item --json
```

---

## 🏗️ Philosophy

1.  **Truth over UI**: The Strapi Admin Panel is a convenient lie. The Database is the truth. The CLI reveals the truth.
2.  **Schema First**: We do not guess. We inspect, then we query.
3.  **Agent Native**: Every command has a `--json` mode that strips all ANSI codes, spinners, and human fluff, delivering raw, machine-readable data envelopes.

---

## 🛠️ Troubleshooting

- **`fetch failed`**: The backend is not running. Run `yarn develop` in the backend workspace.
- **`403 Forbidden`**: Your `STRAPI_AUDIT_TOKEN` is missing or invalid in `.env`.
- **`SyntaxError` in Filters**: Ensure your `--filters` JSON is valid and properly escaped. Use single quotes for the argument wrapper: `'{"foo": "bar"}'`.
