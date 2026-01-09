# 🛑 02. Quality Protocol (THE IRON GATES)

> [!IMPORTANT]
> **No Progress without Proof. LINTING IS NOT OPTIONAL.**

## 1. Mandatory Documentation

**Rule**: If you enter a folder without a `README.md`, **YOU MUST STOP**.
**Action**: Create the README describing Purpose, Architecture, and Usage. Only then proceed.

## 2. THE IRON GATES

Before marking **ANY** task "Done", you must pass the Iron Gates.
**Failure to pass these gates means the task is NOT DONE.**

1.  **Codegen**: `yarn codegen` (Must pass).
2.  **Lint**: `yarn lint` (MUST BE 0 ERRORS, 0 WARNINGS).
    - **Warnings are Errors**. Use `--max-warnings 0`.
3.  **Typecheck**: `yarn typecheck` (MUST BE 0 ERRORS).
4.  **Test**: Run relevant tests.

## 3. Strictness Protocols

- **Lint Warnings**: Fixed immediately. No "later".
- **Types**: Strict. No "knowing better".
- **Proactive Verification**: Don't wait for the user to find bugs. Run the gates yourself.
- **Verification First**: Do not claim success until you have seen the green checkmarks yourself.
