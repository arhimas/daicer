# Antigravity Skills

"Skills" are modular knowledge packs that teach the AI agent how to perform specific tasks within the Daicer environment. Each skill is a directory containing a `SKILL.md` file with detailed instructions, triggers, and examples.

## Available Skills

### 1. `ci-qa-gates`

- **Purpose**: Enforce strict quality assurance (Lint, Typecheck, Test) before finalizing tasks or creating walkthroughs.
- **Triggers**: "verify work", "finish task", "create walkthrough", "check quality".
- **Reference**: `.agent/rules/04-quality-protocol.md`

### 2. `daicer-cli`

- **Purpose**: A skill to interact with the Daicer Backend via the CLI.
- **Triggers**: "status", "schema", "knowledge", "genesis", "explore" (careful with interactive).
- **Command**: `yarn cli`

### 3. `codeconcat`

- **Purpose**: Use the `codeconcat` tool to generate context files from the codebase.
- **Triggers**: "context", "bundle", "read codebase", "concatenate".
- **Command**: `codeconcat`

## How to use a Skill

Simply ask the agent to perform the task associated with the skill. The agent will recognize the intent and load the corresponding instructions from `SKILL.md`.

- "Run the CI gates before I verify this."
- "Get me the schema for the `user` content type."
- "Create a context file for the `src/api` directory."
