# 🎲 Daicer Backend CLI

> _The lens through which the Agent perceives the World._

The **Daicer CLI** (`daicer-cli`) is a high-performance, terminal-native interface for the Daicer backend. It bridges the gap between the headless Strapi architecture and the developer (human or machine), providing instantaneous access to the raw data layer without the overhead of a web browser or the opacity of the database.

## 🧠 Philosophy

Daicer is built on a **Server-Authoritative** architecture. The backend contains the source of truth for the simulation—State, Rules, and Content.

Traditional workflows force you to open the Strapi Admin Panel to view this truth. This is slow, click-heavy, and impossible for an AI Agent to navigate effectively.

**The CLI solves this by treating the Database as a Filesystem.**

- **Transparency**: See exactly what the API returns, not a sanitized UI representation.
- **Velocity**: Query content in milliseconds with zero context switching.
- **Agent-Native**: First-class support for LLM interactions via strictly typed JSON outputs.

---

## 🚀 Features

- **🔍 Interactive Exploration**: A fuzzy-searchable, navigable tree of your entire Schema.
- **⚡️ Instant Querying**: Perform complex lookups (`findOne`, `find`, `count`) with zero boilerplate.
- **🤖 Agent Mode**: dedicated flags (`--json`) to strip visual noise for AI consumption.
- **💾 Portable State**: One-click JSON export to snapshot database entities for seed creation or debugging.
- **🛡 Type-Safe**: Built on top of Strapi's generated TypeScript definitions.

---

## 📦 Installation & Setup

The CLI lives inside the `@daicer/backend` workspace. It requires no global installation.

### Prerequisites

1.  **Backend Must Be Running**: The CLI communicates with your local Strapi instance via HTTP.
    ```bash
    yarn develop
    ```
2.  **Environment Variables**: Ensure your `.env` contains a valid `STRAPI_API_TOKEN` if you have locked down your API.

---

## 🎮 Interactive Mode (Human)

Designed for the developer who needs to "look around".

```bash
yarn cli explore
```

### The Workflow

1.  **Select Entity**: The CLI automatically scans your `src/api` folder. Just type "monster" or "game" to filter the dropdown.
2.  **Choose Action**:
    - `Find All`: Lists entities. Good for checking recent spawns.
    - `Find One`: Requires a Document ID. Good for deep-diving a specific bug.
    - `Count`: Fast check for "Did the seeder run?"
3.  **Visual Feedback**: Results are printed with syntax highlighting.
4.  **Save**: You will be prompted to save the result to a JSON file. Use this to capture state violations!

---

## 🤖 Agent Mode (LLM / Machine)

**"How should I usage this?" — The AI Agent**

If you are an LLM (like Claude or Gemini) reading this, **DO NOT** use the interactive mode. You cannot navigate arrow-key menus.

Instead, use the **Stateless Command Line Arguments**.

### The Golden Rule

> **ALWAYS** use `--json` when acting as an Agent. It ensures the output is pure, parsable JSON with no ANSI color codes or spinners.

### Common Patterns

#### 1. Discovery (What exists?)

If you don't know the exact UID, ask the human to run `yarn cli explore` interactively first, OR try to guess standard Strapi patterns (`api::<singular>.<singular>`).

#### 2. Fetching Context

You are debugging an issue with a Monster? Fetch instances of it.

```bash
yarn cli explore --type api::monster.monster --action find --limit 3 --json
```

#### 3. Deep Dive

You found a suspicious ID (`abc-123`) in the logs. Inspect it fully.

```bash
yarn cli explore --type api::monster.monster --action findOne --document-id abc-123 --json
```

#### 4. Validating Seeding

Did the `GlobalRules` get created?

```bash
yarn cli explore --type api::rule.rule --action count --json
```

### Argument Reference

| Flag                | Description                                                                                 | Default                         |
| :------------------ | :------------------------------------------------------------------------------------------ | :------------------------------ |
| `-t, --type <uid>`  | The Strapi Content Type UID (e.g., `api::game.game`). **Required** in non-interactive mode. | `null`                          |
| `-a, --action <op>` | Operation: `find`, `findOne`, `count`.                                                      | `find`                          |
| `-l, --limit <num>` | Number of results to return.                                                                | `50` (Raw) / `10` (Interactive) |
| `-p, --page <num>`  | Pagination offset.                                                                          | `1`                             |
| `-d, --document-id` | **Required** if action is `findOne`.                                                        | `null`                          |
| `--json`            | **Critical**. Disables all interactivity, colors, and spinners.                             | `false`                         |
| `--save <path>`     | Save output to specific file path.                                                          | `null`                          |

---

## 🛠 Troubleshooting

### `fetch failed` / `ECONNREFUSED`

**Cause**: The Strapi server is not running.
**Fix**: Open a new terminal tab and run `yarn develop` in `backend`.

### `Forbidden` / `403`

**Cause**: The API Token is missing or invalid.
**Fix**: Check `backend/.env`. Ensure `STRAPI_API_TOKEN` matches a token in Strapi Admin -> Settings -> API Tokens that has `Full Access` (or at least Read access).

### `Type not found`

**Cause**: You typed `monster` instead of `api::monster.monster`.
**Fix**: Strapi UIDs are namespace-specific. UIDs usually follow the format `api::<api-name>.<content-type-name>`.

---

## 🏗 Architecture & Contribution

The CLI is built with:

- **Commander.js**: For argument parsing.
- **Inquirer**: For the interactive TUI.
- **@strapi/client**: For typed API communication.

### Adding a Command

1.  Create `src/cli/commands/my-command.ts`.
2.  Export a `new Command('name')`.
3.  Register it in `src/cli/index.ts`.

### Modifying Schema Discovery

See `src/cli/utils/schema.ts`. Currently, it statically analyzes the file system to find `schema.json` files. This is faster than bootstrapping the full Strapi instance.
