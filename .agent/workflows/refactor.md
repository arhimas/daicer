---
description: Standard operating procedure for code refactoring and modernization.
---

# Workflow: Refactoring Protocol

**Description**: Use this workflow for code cleanup, restructuring, or modernization. It prioritizes safety and stability, ensuring that functional behavior is preserved during structural changes.

## Steps

### 1. Safety Baseline

1.  **Pre-Flight Check**: Run all tests _before_ touching a single line of code.
    - _Abort_: If tests fail initially, fix them or simple-fix them first. You cannot refactor on broken ground.

### 2. Strategy Selection

1.  **Identify Pattern**: Choose a refactoring strategy (e.g., "Extract Method", "Rename Symbol", "Strangler Fig").
2.  **Plan**: If the refactor is large, outline the steps in `implementation_plan.md`.

### 3. Execution (Atomic Steps)

1.  **Small Moves**: Make one structural change at a time.
2.  **Intermediate Verification**: Run tests frequently (e.g., after every file change).
3.  **Dependency Check**: Ensure imports and exports are updated correctly.

### 4. Final Verification

1.  **Parity Check**: The system must behave exactly as it did before (unless behavior change was explicitly requested).
2.  **Quality Gates**: `yarn lint` and `yarn typecheck` must be clean.

### 5. Cleanup

1.  **Deprecation**: If old code was replaced, remove it (unless a deprecation phase is required).
2.  **Comments**: Update code comments to match the new structure.
