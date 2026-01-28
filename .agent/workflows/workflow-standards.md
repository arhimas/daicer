---
description: Definition and standards for Antigravity Agent Workflows
---

# Workflow Standards

**Description**: This document defines the standard format and structure for all `.agent/workflows/*.md` files. These workflows are intended to be read and executed by the "Antigravity" AI agent to perform complex, multi-step engineering tasks with high reliability and autonomy.

## Workflow Structure

All workflows must adhere to the following structure:

### 1. Frontmatter
Must include a `description` field summarizing the workflow's purpose.

```markdown
---
description: [Short action-oriented description, e.g., "Standard protocol for implementing new features"]
---
```

### 2. Header
A concise H1 title matching the filename or core action.

### 3. Description Section
A brief paragraph explaining *what* this workflow achieves and *when* it should be triggered.

### 4. Steps
Numbered steps that guide the agent's execution.
*   **Actionable**: Each step must be a clear instruction.
*   **Explicit**: Do not assume prior context; state the tool or method to use.
*   **Turbo Mode**: Use the `// turbo` annotation for `run_command` steps that can be safely auto-executed (e.g., mkdir, git checkout). Use `// turbo-all` at the top of the file if *all* commands are safe.

## Standard Checkpoints

Every engineering workflow should include these phases where applicable:

1.  **Discovery/Planning**: Read KIs, check existing code, create a plan.
2.  **Execution**: The core work (coding, refactoring).
3.  **Verification**: The "Quality Gate". Must explicitly call for running tests, linters, or build checks.
4.  **Documentation**: Update artifacts or Knowledge Items.

## Style Guide

*   **Tone**: Imperative, direct ("Run this...", "Create that...").
*   **Filesystem**: Always use absolute paths or relative paths from the workspace root.
*   **Tools**: Reference specific agent tools (e.g., "Use `codebase_search` to find...") when helpful.
