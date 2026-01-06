# �� 05. Testing Mandate

> [!IMPORTANT]
> **Speed, Isolation, and Coverage.**

## 1. Speed Limit
- **Backend Tests**: MUST run in under **30 seconds**.
- **Action**: Delete or Refactor slow tests.

## 2. Mocking
- **LLM**: NEVER call external APIs. Mock them.
- **Strategy**: Test the schema interaction, not the AI intelligence.

## 3. Frontend Coverage
- **Storybook**: Mandatory for **ALL** Components (Presentational, Container, Page).
- **Snapshots**: Used but not abused.

## 4. Hostile Testing
- Always test "Access Denied" (403) scenarios.
- Verify security boundaries explicitly.
