# 8. Agentic Architecture

This rule mandates the use of **Agentic Architecture patterns** (specifically "Thinking in LangGraph") for all complex logic and workflow implementation.

## Mandate

### 1. Discrete Nodes
*   **Rule**: Break complex workflows into discrete, single-purpose steps (Nodes).
*   **Why**: Improves debuggability, checkpointing, and error handling.
*   **Prohibited**: Monolithic functions that handle parsing, logic, and side-effects in one block.

### 2. Shared State
*   **Rule**: Use a shared `State` object to pass data between nodes.
*   **Data Purity**: Store **RAW DATA** in the state, not formatted strings or prompts. Formatting happens *inside* the node just before use.
*   **Schema**: Define state strictly (e.g., using Zod or TypeScript interfaces).

### 3. Human-in-the-Loop
*   **Rule**: Design for interruption. Critical decisions or high-risk actions MUST have a "Review" node or interrupt capability.
*   **Persistence**: The state must be serializable so the agent can pause and resume.

### 4. Error Handling
*   **Rule**: Errors should be handled at the Node level.
    *   **Transient**: Retry automatically.
    *   **Logic**: Route to a fallback node or error state.
    *   **Critical**: Bubble up to stop execution (and notify user).

## Reference
See `.agent/knowledge/ai/thinking_in_langgraph.md` for the complete methodology.
