# 🛑 02. Quality Protocol

> [!IMPORTANT]
> **No Progress without Proof.**

## 1. Mandatory Documentation
**Rule**: If you enter a folder without a `README.md`, **YOU MUST STOP**.
**Action**: Create the README describing Purpose, Architecture, and Usage. Only then proceed.

## 2. The Verification Gates
Before marking any task "Done":
1.  **Codegen**: `yarn codegen` (Must pass).
2.  **Lint**: `yarn lint` (Zero warnings allowed).
3.  **Typecheck**: `yarn typecheck` (Zero errors allowed).
4.  **Test**: Run relevant tests.

## 3. Strictness
- **Lint Warnings**: Fixed immediately.
- **Types**: Strict.
