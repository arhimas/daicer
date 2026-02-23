# PLAN-genesis-engine

**Goal**: Build "Genesis Engine", a SOTA AI-driven data factory for Daicer.
**Scope**: CLI + Strapi Admin Plugin (Root, List, Edit Views).
**Key Feature**: Chat-based generation with "Dry Run" validation.
**Core Requirement**: 100% Test Coverage (Statements, Branches, Functions, Lines).
**Stack**: Strapi 5, React, Gemini 3 Flash/Pro, LangChain/LangGraph.

---

## 🏗️ Architecture

We will implement a **Hexagonal Architecture** (Ports & Adapters) to share 100% of the logic between CLI and Admin Plugin.

### 1. `src/features/genesis-core` (The Brain)

- **Responsibility**: LLM orchestration, Context Management (Schema RAG), Validation Logic, persistence (Dry/Live).
- **Components**:
  - `AgentOrchestrator`: Manages the LangGraph state (User -> Flash -> Validator -> Pro -> User).
  - `SchemaLoader`: Reads the `schema/*.json` files as ground truth.
  - `ValidationEngine`: Wraps `strapi.documents().validate()` and handles "Dry Run" persistence (JSON files or Drafts).
  - `PromptFactory`: Manages Gemini 3 system prompts.

### 2. `src/cli/commands/genesis` (The Terminal Adapter)

- **Responsibility**: CLI UX for the Genesis Core.
- **Tools**: `ink` (React for CLI) or standard `inquirer` for chat simulation.

### 3. `src/plugins/genesis-admin` (The UI Adapter)

- **Responsibility**: Strapi Admin interface.
- **Locations**:
  - **Root Page**: `/admin/plugins/genesis` - Dashboard & Global Chat.
  - **Injection**: Injects into Content Manager "List View" (Bulk Action) and "Edit View" (Sidebar/Panel).

---

## ⚛️ Atomic Design Strategy (The "Triple View")

To ensure data integrity and avoid "hallucinated dependencies", we will enforce a strict generation order. The LLM will be prompted to "think in atoms" first.

### Level 0: Atoms (Dependencies: None)

_Entities that define the physics/rules of the world._

- `damage-type`, `size`, `language`, `magic-school`, `condition`
- `equipment-category`, `weapon-property`, `proficiency`
- **Prompt Strategy**: "Generate the fundamental constants. Do not reference anything else."

### Level 1: Molecules (Dependencies: Atoms)

_Standalone game elements that use Atoms._

- `spell` (uses `magic-school`, `action`, `damage-type`)
- `item` (uses `equipment-category`, `weight`, `cost`)
- `feature` (uses `action`, `description`)
- `trait` (uses simple validation logic)
- **Prompt Strategy**: "Construct a Spell using valid Magic Schools and Damage Types from the Context."

### Level 2: Compounds (Dependencies: Molecules + Atoms)

_Complex structures that aggregate Molecules._

- `class` (aggregates `feature`s, `proficiency`, `starting-equipment`)
- `race` (aggregates `trait`s, `size`, `speed`)
- `subclass` (extends `class`, adds `feature`s)
- **Prompt Strategy**: "Design a Class by assembling existing Features and Proficiencies."

### Level 3: Organisms (Dependencies: All)

_The Blueprints (not the instances)._

- `api::entity.entity` ("Monster" or "Character" definition)
- Aggregates: `stat-block`, `feature` list, `action` list, `trait` list.
- **Prompt Strategy**: "Design a Goblin Shaman Entity (Blueprint) with these Spells and Actions."

### Level 4: Instances (Runtime Only)

_The In-Game representation._

- `api::entity-sheet.entity-sheet`
- Instantiated from an `entity` blueprint.
- **Genesis Role**: Genesis focuses on Level 0-3 (Blueprints). Level 4 is for "Simulations" or "Playtesting".

---

## 🗓️ Phased Execution Plan

### Phase 1: Genesis Core & Testing Harness (The Foundation)

_Goal: A headless, fully tested engine capable of generating valid entities._

- [ ] **Scaffold**: Create `src/features/genesis-core`.
- [ ] **Schema Engine**: Implement `SchemaLoader` to feed `schema/*.json` to LLMs.
- [ ] **LLM Bridge**: Setup Gemini 3 Flash (Generation) and Pro (Correction).
- [ ] **Validation Logic**: Implement `DryRunService` using Strapi's internal validation.
- [ ] **Testing**: Setup Vitest with 100% coverage enforcement for `genesis-core`.

### Phase 2: The CLI Interface (Early Feedback)

_Goal: Verify the engine works via terminal before building complex UI._

- [ ] **CLI Command**: `yarn cli genesis chat --model [uid]`.
- [ ] **Feedback Loop**: Implement the interactive chat loop in terminal.
- [ ] **File Output**: Ensure "Dry Run" saves readable JSONs for verification.

### Phase 3: The Strapi Admin Plugin (The Experience)

_Goal: Deep integration into the Strapi workflow._

- [ ] **Plugin Setup**: Generate `strapi-plugin-genesis`.
- [ ] **Chat Component**: Build a reusable `GenesisChat` React component (Gemini UI).
- [ ] **Injection Points**:
  - **Global**: Main plugin page.
  - **List View**: "Ask Genesis to Populate" button.
  - **Edit View**: "Ask Genesis to Fill/Refine" sidebar.
- [ ] **Draft API**: Ensure the plugin creates `publishedAt: null` drafts.

### Phase 4: SOTA Hardening (The Iron Gates)

_Goal: 100% Coverage and Stability._

- [ ] **Test Audits**: Run coverage reports specific to Genesis.
- [ ] **Edge Cases**: Test hallucinations, schema drifts, validation failures.
- [ ] **Docs**: Documentation for "Genesis Prompting Strategy".

### Phase 5: The Grand Permutation (Seed Data)

_Goal: Generate a "Starter Set" of Level 1 Entities for every Race/Class combination._

- [ ] **Permutation Script**: Script that loops through all `race` and `class` schemas.
- [ ] **Generation**: Create ~150 Level 1 Entities (e.g., "Elven Wizard", "Dwarven Barbarian").
- [ ] **Quality Check**: Verify that "Description", "Stats", and "Starting Equipment" match the combo.
- [ ] **Validation**: Ensure all 150+ files pass the `ValidationEngine`.

---

## 🧪 Verification Plan (100% Coverage)

Every PR/Commit regarding Genesis MUST pass:

1.  **Unit**: Mocked LLM responses checking internal state transitions.
2.  **Integration**: Real usage of Strapi Document Service (using SQLite memory DB).
3.  **Behavioral**: Test the "Retry Loop" (Fail -> Pro Fix -> Success).

## 🤖 Agent Assignments

- **`backend-specialist`**: Genesis Core, Strapi Validation, CLI.
- **`frontend-specialist`**: Admin Plugin UI, Chat Component.
- **`qa-engineer`**: Enforcing 100% coverage and mocking strategy.

---

## ❓ Clarification Questions (Socratic Gate)

1.  **State Storage**: For the "Chatbot" history, should we store conversation logs in the DB or keep them ephemeral (session-only)?
    _Assumption: Ephemeral for now, maybe local storage._
2.  **Cost Control**: Do we need rate limiting or token counting for Gemini 3 usage?
    _Assumption: User provides API key, basic logging suffices._

---

**Next Steps**:

1.  User approves Plan.
2.  We start **Phase 1: Genesis Core**.
