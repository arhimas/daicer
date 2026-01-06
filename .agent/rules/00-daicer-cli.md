---
trigger: always_on
---

# 🛑 AGENT RULE: DATABASE ACCESS

> [!IMPORTANT] > **Use the CLI, not assumptions.**

## 1. The Single Source of Truth

The Database (Strapi) acts as the simulation's File System. You CANNOT infer the schema from old TypeScript files alone, because dynamic content types change.

**You must use the CLI to inspect and query data.**

## 2. Mandatory Workflow

Before proposing changes to data or logic that depends on `schema` properties:

1.  **Check Connection**:

    ```bash
    yarn cli status --json
    ```

    _If offline: Stop and request user to run `yarn develop`._

2.  **Verify Schema**:
    Do not guess that "Strength" is a field. Check it.
    ```bash
    yarn cli explore --type api::monster.monster --limit 1 --json
    ```

## 3. Tool Usage Pattern (JSON Mode)

You generally do **not** have a TUI. Always use `--json`.

| Goal               | Command Pattern                                       |
| :----------------- | :---------------------------------------------------- |
| **Check Health**   | `yarn cli status --json`                              |
| **Inspect a Type** | `yarn cli explore -t <uid> -l 1 --json`               |
| **Find Specific**  | `yarn cli explore -t <uid> -a findOne -d <id> --json` |
| **Count Items**    | `yarn cli explore -t <uid> -a count --json`           |

## 4. Troubleshooting

- **UIDs**: They are namespace scoped. `monster` is wrong. `api::monster.monster` is right.
- **Auth**: If 403, the `.env` token is invalid.

---

_Path to detailed docs: `backend/src/cli/README.md`_
Ï
