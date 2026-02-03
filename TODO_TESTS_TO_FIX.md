# Test Suite Fix Plan

## 🚨 Critical Failures (Blocking Coverage)

The following tests were observed failing or hanging during the integration run:

### 1. Forge System Integration
- **File:** `src/plugins/map-explorer/server/src/services/__tests__/forge-system-integration.test.ts`
- **Issue:** Excessive runtime (hundreds of scenarios), console warnings about "Context Injection Failed".
- **Status:** 🔴 Failing / Slow

### 2. Queue Dashboard Admin
- **File:** `src/plugins/queue-dashboard/admin/src/pages/__tests__/HomePage.test.tsx`
- **Issue:** Hanging / Queued for long periods.
- **Status:** 🟠 Hanging

### 3. General Failures
- **Count:** ~79 Test Files failed in the last run.
- **Action:** Need to re-run with a lighter reporter to capture the full list of failing filenames without hanging the system.

## Action Plan
1. Fix `forge-system-integration.test.ts` (Likely mocking or timeout issue).
2. Fix `HomePage.test.tsx`.
3. Re-run suite to identify other easy fixes.
