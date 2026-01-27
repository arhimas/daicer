# 🛑 02. The Strapi Imperative (The Blood Oath)

> [!CRITICAL]
> **YOU ARE BLIND WITHOUT DOCS.**
> Strapi 5 has specific, non-negotiable patterns. Guessing them is **FATAL**.
> You **MUST** consult the local documentation before writing backend code.

## 1. The Search Mandate

Before writing ANY Controller, Service, Policy, or Content Type:

1.  **Stop**. Do not guess the API.
2.  **Consult the Master Map**: Read [`STRAPI_DOC/00_STRAPI_MASTER_MAP.md`] using `view_file`.
3.  **Search the Vault**: Use `grep_search` on `STRAPI_DOC/` for keywords (e.g., "Document Service", "entity filters").
4.  **Verify**: Only AFTER you have found the definitive reference, proceed to code.

## 2. The "No Hallucination" Pact

- **FORBIDDEN**: "I think the API is..."
- **REQUIRED**: "According to `STRAPI_DOC/packages-all/strapi/README.md`, the API is..."
- **ENFORCEMENT**: If you use a deprecated Strapi 4 API (e.g., `strapi.entityService` where `strapi.documents` is required), you have **FAILED**.

## 3. The Path to Truth

- **Official Guides**: `STRAPI_DOC/content/`
- **Internal Specs**: `STRAPI_DOC/packages-all/`
- **Architectural RFCs**: `STRAPI_DOC/rfcs/`

> **When in doubt, READ THE DOCS.**


## 4. Plugin Isolation & Dependencies

- **Rule**: Plugins are sovereign territories.
- **Dependencies**:
    - Each plugin (e.g., `src/plugins/my-plugin`) **MUST** have its own `package.json`.
    - If a plugin imports a library (e.g., `axios`, `date-fns`), it **MUST** be listed in that plugin's `package.json`.
    - **FORBIDDEN**: Relying on root repo hoisting (Phantom Dependencies).
- **Verification**: Run `yarn why <package>` inside the plugin directory to prove ownership.
