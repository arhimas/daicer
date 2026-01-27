# 🛑 03. Quality Protocol (The Iron Gates)

> [!IMPORTANT]
> **No Progress without Proof.**

## 1. The Iron Gates

You cannot mark a task as "Done" until you pass the Gates.

1.  **Codegen**: `yarn codegen` (Must pass).
2.  **Lint**: `yarn lint` (0 Errors, 0 Warnings). **Warnings are Errors.**
3.  **Typecheck**: `yarn typecheck` (0 Errors).
4.  **Test**: `yarn test` (Must pass).

## 2. Proactive Verification

- **Do not wait** for the user to run these. Run them yourself after **EVERY** significant change.
- **Fix immediately**: If Lint fails, fix it *now*. Do not continue writing logic on broken foundations.

## 3. Dependency Management

- **Yarn Only**: Never use `npm`.
- **Lockfile**: `yarn.lock` is sacred. Do not delete it to "fix" issues.

## 4. The "Works on My Machine" ban

- You must verify that the code works in the **actual environment**.
- If it compiles but crashes at runtime, you have FAILED.
