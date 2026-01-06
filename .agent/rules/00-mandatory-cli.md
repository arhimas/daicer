# 🛑 00. Mandatory CLI Usage

> [!IMPORTANT]
> **Use the CLI. Do not guess schemas. Do not assume types.**

The `daicer-cli` is your eyes and ears. It is the only reliable way to interact with the backend data layer.

## 1. The Single Source of Truth

The Database (Strapi) is the file system. Old TypeScript types are hints, not truth.
**You MUST use the CLI to inspect data.**

👉 **Full Documentation**: [backend/src/cli/README.md](file:///Users/lg/lab/daicer/backend/src/cli/README.md)

## 2. The "Schema-First" Strategy (Mental Model)

When a human or an agent needs to retrieve data, the flow is always:

1.  **Introspect**: "What fields exist on this type?"
2.  **Filter**: "How do I ask for exactly what I want?"
3.  **Execute**: "Get the data."

### Step 1: Introspect
Don't guess that a field is named `isTemplate` or `is_template`. Check the schema.

```bash
yarn cli schema --type api::monster.monster --json
```

### Step 2: Filter (Precision Querying)
Use the schema knowledge to construct precise filters via strict JSON.

```bash
# Found field: "is_template" (boolean)
yarn cli explore \
  --type api::monster.monster \
  --filters '{"is_template": true}' \
  --json
```

## 3. Mandatory Workflow (Agent Protocol)

Before proposing changes to schema-dependent logic:

1.  **Check Status**: `yarn cli status --json`
    *   *If offline, STOP and ask user to run `yarn develop`.*
2.  **Verify Schema**: `yarn cli schema -t <uid> --json`
3.  **Inspect Data**: `yarn cli explore -t <uid> -l 1 --json`

## 4. Cheat Sheet (Agent Mode)

| Goal | Command |
| :--- | :--- |
| **List UIDs** | `yarn cli schema --list --json` |
| **Get Schema** | `yarn cli schema --type <uid> --json` |
| **Find One** | `yarn cli explore --type <uid> --action findOne --document-id <id> --json` |
| **Search** | `yarn cli explore --type <uid> --filters '{"field": "value"}' --json` |
| **Count** | `yarn cli explore --type <uid> --action count --json` |

## 5. Troubleshooting (Self-Healing)

*   **`fetch failed`**: The server is down. Ask user to start it.
*   **`Type not found`**: You likely guessed the UID. Run `yarn cli schema --list --json` to find the correct one.
*   **`403 Forbidden`**: Token issue. Do not attempt to fix tokens yourself; report it.
