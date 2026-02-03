# Failing Tests Tracker

## Status
- [x] Initial Scan Run
- [x] Fix Batch 1 (Module Resolution/Aliases)
- [x] Fix Batch 2
- [x] Verification

## Failing Tests List

### Systemic Issues
- [x] **Module Resolution (@daicer/engine)**: ~70 tests failing with `Cannot find package '@daicer/engine/...'`.
  - **Resolution**: Fixed in `vitest.config.ts` by moving aliases to root `resolve` object and pointing to directories.
  - **Status**: FIXED.

### Specific Failures
- None. All 142 test files passing.
