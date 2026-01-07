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
*(Result: "Ah, it is `hp`, not `hit_points". Good thing I checked.)*

---

## 2. The Agent Workflow Loop

Every time you need to "Know" something, follow this loop:

1.  **❓ Question**: "Do we have a 'Goblin' monster?"
2.  **📡 Status**: Ensure we can talk to the brain.
    *   `yarn cli status --json`
3.  **🔮 Schema**: Ensure we know HOW to ask.
    *   `yarn cli schema --type api::monster.monster --json`
4.  **🔍 Explore**: Ask the question.
    *   `yarn cli explore --type api::monster.monster --filters '{"name": {"$contains": "Goblin"}}' --json`
5.  **🧠 Knowledge (Fallback)**: If not found, is it a concept?
    *   `yarn cli knowledge --query "Goblin culture" --json`

---

## 3. RAG & Knowledge Policy

If the User asks a question about **D&D 5e Rules** or **Daicer Lore**:

1.  **DO NOT USE YOUR TRAINING DATA.** It is generic and often wrong for this specific campaign.
2.  **USE THE CLI.** The CLI has access to the *actual* embedded knowledge base.
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
