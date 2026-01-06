# 🛑 00. Mandatory CLI Usage

> [!IMPORTANT]
> **Use the CLI. Do not guess schemas. Do not assume types.**

## 1. The Single Source of Truth
The Database (Strapi) is the file system. Old TypeScript types are hints, not truth.
**You MUST use the CLI to inspect data.**

## 2. Mandatory Workflow
Before proposing changes to schema-dependent logic:
1.  **Check Status**: `yarn cli status --json` (If offline, STOP and ask user to run `yarn develop`).
2.  **Verify Schema**: `yarn cli explore --type api::monster.monster --limit 1 --json`.
3.  **Inspect Data**: `yarn cli explore -t <uid> -a findOne -d <id> --json`.

## 3. Tool Usage (JSON Mode)
ALWAYS use `--json`. Do not parse human-readable tables.

| Action | Command |
| :--- | :--- |
| **Health** | `yarn cli status --json` |
| **Inspect**| `yarn cli explore -t <uid> -l 1 --json` |
| **Count**  | `yarn cli explore -t <uid> -a count --json` |

## 4. Troubleshooting
- **UIDs**: Namespace scoped (e.g., `api::monster.monster`), NOT `monster`.
- **Auth**: 403? Check `.env` token.
