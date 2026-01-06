# 🛑 03. Backend Architecture

> [!IMPORTANT]
> **GraphQL Protocol & Strapi Truth.**

## 1. Interaction Protocol
- **GraphQL**: The ONLY way to talk to data (Frontend -> Backend).
- **Exceptions**: Auth providers, File Uploads (REST allowed).
- **Client**: Internal scripts use `@strapi/client`.

## 2. Universal IDs
- **Public/Relations**: ALWAYS use `documentId` (String).
- **Internal**: Integer IDs are for Postgres counting only.

## 3. Logic & Truth
- **Source**: Logic/Game Rules/Constants live in Strapi, NOT code constants.
- **Derivation**: "Truth is a Derivation". Do not store what can be calculated.
- **Game Balance**: Tweakable via DB, not Deploy.

## 4. Prompts
**Rule**: Prompts live in Strapi.
**Why**: Iteration without deployment.
**No Hardcoded Prompts**.
