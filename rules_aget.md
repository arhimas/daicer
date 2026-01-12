File: 00-mandatory-cli.md
""""""
# �� 00. Mandatory CLI Usage

> [!CRITICAL]
> **DAICER-CLI IS MANDATORY.**
> You are **FORBIDDEN** from guessing database content.
> You are **FORBIDDEN** from hallucinating game rules.
> You **MUST** use the CLI to perceive the world.

## 1. The Prime Directive: "Schema First"

Before you write ANY code that interfaces with the database (EntityAdapter, SpawnService, etc.), you must **verify the schema**.

❌ **Incorrect (Guessing):**

> "I'll assume the monster has a `hit_points` field."

✅ **Correct (Verifying):**

> "I will check the monster schema to see the exact field name."

```bash
yarn cli schema --type api::monster.monster --json
```

_(Result: "Ah, it is `hp`, not `hit_points". Good thing I checked.)_

---

## 2. The Agent Workflow Loop

Every time you need to "Know" something, follow this loop:

1.  **❓ Question**: "Do we have a 'Goblin' monster?"
2.  **📡 Status**: Ensure we can talk to the brain.
    - `yarn cli status --json`
3.  **🔮 Schema**: Ensure we know HOW to ask.
    - `yarn cli schema --type api::monster.monster --json`
4.  **🔍 Explore**: Ask the question.
    - `yarn cli explore --type api::monster.monster --filters '{"name": {"$contains": "Goblin"}}' --json`
5.  **🧠 Knowledge (Fallback)**: If not found, is it a concept?
    - `yarn cli knowledge --query "Goblin culture" --json`

---

## 3. RAG & Knowledge Policy

If the User asks a question about **D&D 5e Rules** or **Daicer Lore**:

1.  **DO NOT USE YOUR TRAINING DATA.** It is generic and often wrong for this specific campaign.
2.  **USE THE CLI.** The CLI has access to the _actual_ embedded knowledge base.
    ```bash
    yarn cli knowledge --query "How does the Entropy system work?" --json
    ```

---

## 4. Cheat Sheet (Copy-Paste)

**Check Connection:**

```bash
yarn cli status --json
```

**Find Content Type UIDs:**

```bash
yarn cli schema --list --json
```

**Inspect a Schema:**

```bash
yarn cli schema -t <uid> --json
```

**Search Data (Precision):**

```bash
yarn cli explore -t <uid> --filters '{"field": "value"}' --json
```

**Search Rules/Lore (Semantic):**

```bash
yarn cli knowledge -q "Search Query" --json
```

---

> **REMEMBER:** The `yarn cli` command (without args) is for HUMANS. You are an AGENT. **ALWAYS USE `--json`**.
""""""


File: 01-coding-standards.md
""""""
# 🛑 01. Coding Standards (The Law)

> [!IMPORTANT]
> **Strict enforcement of Hygiene, Naming, and Type Safety.**

## 1. The 200-Line Limit

**Rule**: No file shall exceed 200 lines.
**Enforcement**: **STOP & REFACTOR**. Split components, extract hooks, or move logic to services.
**Exceptions**: JSON, Markdown, Seeds, Generated Types.

## 2. THE ZERO ANY MANDATE

**Rule**: `any` and `unknown` are **STRICTLY FORBIDDEN**.
**Enforcement**:

- **NEVER** use `any`. Not for "quick fixes", not for "temporary" code.
- **NEVER** use `unknown` unless you are immediately narrowing it with a Zod schema or Type Guard.
- **Backend Data**: If you don't trust the shape, use `zod` to validate it.
- **Generics**: Use proper Generics or Discriminated Unions.
- **Casting**: `as` casting is highly discouraged. Use type predicates.

## 3. Strict Type Safety

**Rule**: All functions must have explicit return types.
**Rule**: All Props interfaces must be explicit.
**Rule**: No implicit `any`.

## 4. Naming Conventions

**Rule**: **NO ABBREVIATIONS**. Clarity over brevity.
**Whitelist**: `id`, `html`, `url`, `db`, `ui`.
**Examples**:

- ❌ `minVal`, `charSheet`, `ctx`, `params`
- ✅ `minimumValue`, `characterSheet`, `context`, `parameters`

## 5. DRY & Atomic

- **DRY**: Redundancy is allowed only if it increases reliability and decoupling. Otherwise, extract.
- **Atomic**: Commits/Tooling steps can be batched, but changes must be focused.

## 6. Package Management

**Rule**: **Yarn Only**.
**Lockfile**: `yarn.lock` is sacred. Never mix with `npm`.
""""""


File: 02-quality-protocol.md
""""""
# 🛑 02. Quality Protocol (THE IRON GATES)

> [!IMPORTANT]
> **No Progress without Proof. LINTING IS NOT OPTIONAL.**

## 1. Mandatory Documentation

**Rule**: If you enter a folder without a `README.md`, **YOU MUST STOP**.
**Action**: Create the README describing Purpose, Architecture, and Usage. Only then proceed.

## 2. THE IRON GATES

Before marking **ANY** task "Done", you must pass the Iron Gates.
**Failure to pass these gates means the task is NOT DONE.**

1.  **Codegen**: `yarn codegen` (Must pass).
2.  **Lint**: `yarn lint` (MUST BE 0 ERRORS, 0 WARNINGS).
    - **Warnings are Errors**. Use `--max-warnings 0`.
3.  **Typecheck**: `yarn typecheck` (MUST BE 0 ERRORS).
4.  **Test**: Run relevant tests.

## 3. Strictness Protocols

- **Lint Warnings**: Fixed immediately. No "later".
- **Types**: Strict. No "knowing better".
- **Proactive Verification**: Don't wait for the user to find bugs. Run the gates yourself.
- **Verification First**: Do not claim success until you have seen the green checkmarks yourself.
""""""


File: 03-backend-architecture.md
""""""
# 🛑 03. Backend Architecture

> [!IMPORTANT]
> **GraphQL Protocol & Strapi Truth.**

## 1. Interaction Protocol

- **GraphQL**: The ONLY way to talk to data (Frontend -> Backend).
- **Exceptions**: Auth providers, File Uploads (REST allowed).
- **Client**: Internal scripts use `@strapi/client`.

## 2. Universal IDs

- **Public/Relations**: ALWAYS use `documentId` (String).
- **Internal**: Integer IDs are for Postgres counting only.

## 3. Logic & Truth

- **Source**: Logic/Game Rules/Constants live in Strapi, NOT code constants.
- **Derivation**: "Truth is a Derivation". Do not store what can be calculated.
- **Game Balance**: Tweakable via DB, not Deploy.

## 4. Prompts

**Rule**: Prompts live in Strapi.
**Why**: Iteration without deployment.
**No Hardcoded Prompts**.
""""""


File: 04-engine-supremacy.md
""""""
# 🛑 04. Engine Supremacy

> [!IMPORTANT]
> **The Engine is Law. The LLM is the Bard.**

## 1. The Hierarchy

1.  **Engine**: Deterministic Physics & Rules (TypeScript).
2.  **LLM**: Narration & Creativity.

## 2. No Interpretation of Mechanics

- If Engine says `1d20 = 2 (Miss)`, the LLM **CANNOT** describe a hit.
- The LLM receives the **Result** and generates **Lore**.
- **No Hallucination**: You strictly follow the Engine's math.

## 3. Execution

- We trust the code.
- We do not trust the token probability.
""""""


File: 05-testing-mandate.md
""""""
# �� 05. Testing Mandate

> [!IMPORTANT]
> **Speed, Isolation, and Coverage.**

## 1. Speed Limit

- **Backend Tests**: MUST run in under **30 seconds**.
- **Action**: Delete or Refactor slow tests.

## 2. Mocking

- **LLM**: NEVER call external APIs. Mock them.
- **Strategy**: Test the schema interaction, not the AI intelligence.

## 3. Frontend Coverage

- **Storybook**: Mandatory for **ALL** Components (Presentational, Container, Page).
- **Snapshots**: Used but not abused.

## 4. Hostile Testing

- Always test "Access Denied" (403) scenarios.
- Verify security boundaries explicitly.
""""""


