---
description: Standard operating procedure for diagnosing and fixing bugs.
---

# Workflow: Bug Fix Protocol

**Description**: Use this workflow when a bug is reported or discovered. It enforces a scientific method approach: Reproduction -> Isolation -> Fix -> Verification.

## Steps

### 1. Reproduction & Analysis

1.  **Analyze**: Read the error logs, stack traces, or user description carefully.
2.  **Check Knowledge**: Look for "Troubleshooting" sections in relevant KIs.
3.  **Reproduction**: Create a minimal reproduction script or test case that reliably demonstrates the failure.
    - _Goal_: Turn the qualitative bug into a quantitative failure (red test).

### 2. Isolation (Binary Search)

1.  **Trace**: Identify the root cause component.
2.  **Isolate**: If the codebase is large, use binary search tactics (commenting out sections) to pinpoint the exact line or logic flaw.

### 3. Remediation

1.  **Fix**: Apply the correction.
2.  **Verify Local**: Run the reproduction script. It should now pass (green test).

### 4. Universal Verification

1.  **Regressions**: Run the broader test suite to ensure no side effects.
2.  **Quality Gates**: Run `yarn lint` and `yarn typecheck` to ensure the fix meets code standards.

### 5. Documentation

1.  **Task**: Update `task.md` with the fix details.
2.  **Walkthrough**: briefly explain the root cause and fix in `walkthrough.md` if non-trivial.
