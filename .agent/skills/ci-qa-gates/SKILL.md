---
name: ci-qa-gates
description: Enforces quality gates (Lint, Typecheck, Test) before task completion.
---

# CI/QA Gates Skill

Use this skill when the user asks to "verify", "finish", "check quality", or before creating a `walkthrough.md`. This ensures that no broken code is committed or presented as complete.

## Instructions

1.  **Check for Lint Errors**:
    - Run `yarn lint` to check for ESLint errors.
    - If errors exist, fix them (or ask user if complex).
2.  **Check for Type Errors**:
    - Run `yarn typecheck` to ensure Type Safety.
    - **CRITICAL**: Do not ignore type errors. Fix them.
3.  **Run Tests**:
    - Run `yarn test` (or specific tests related to changes).
    - Ensure green light.
4.  **Formatting**:
    - Run `yarn format` to ensure Prettier compliance.

## Commands

```bash
yarn lint
yarn typecheck
yarn test
yarn format
```

## Protocol Reference

Refer to `.agent/rules/04-quality-protocol.md` for the strict definitions of these gates.
