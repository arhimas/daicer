---
description: Standard operating procedure for implementing new features or capabilities.
---

# Workflow: New Feature Implementation

**Description**: Use this workflow when the user asks for a new feature, component, or capability. It ensures a rigorous design-first approach that validates alignment with existing architecture before writing code.

## Steps

### 1. Discovery & Planning

1.  **Check Knowledge**: Review `KI Summaries` and read relevant KIs to understand architectural patterns.
2.  **Gap Analysis**: Identify what is missing vs. what exists.
3.  **Plan**: Create or update `implementation_plan.md` in the current brain artifact directory.
    - _Mandatory_: Include a "Verification Plan" section.
4.  **Review**: Ask the User for approval on the plan (using `notify_user`).

### 2. Execution (TDD Preferred)

1.  **Test First**: If possible, write a failing test or a reproduction script that defines the expected behavior.
2.  **Implement**: Write the code to satisfy the requirements.
    - _Constraint_: Follow "Antigravity" coding standards (TypeScript, strict types, no `any`).
3.  **Iterate**: Run the test/script to verify progress.

### 3. Verification & Quality Gates

1.  **Lint**: Run project linters (e.g., `yarn lint`).
2.  **Typecheck**: Run type checkers (e.g., `yarn typecheck`, `tsc --noEmit`).
3.  **Test**: Run the full test suite or relevant subset.
    - _Constraint_: All checks must pass with "Absolute Zero" warnings/errors.

### 4. Documentation & Cleanup

1.  **Artifacts**: Create a `walkthrough.md` if the feature is complex/visual.
2.  **Knowledge**: Identify if a new KI is needed or if an existing one should be updated.
3.  **Clean**: Remove temporary test scripts or debug logs.
