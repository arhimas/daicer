# AGENTS.md

> **Purpose**: This file provides high-level context and instructions for AI agents working on the Daicer project.
> **Authority**: This file complements `GEMINI.md` (Rules) and `CODEBASE.md` (Structure).

## 🏗️ Dev Environment Summary

| Command          | Action       | Description                                                                               |
| :--------------- | :----------- | :---------------------------------------------------------------------------------------- |
| `yarn dev`       | **Start**    | Starts Backend (Strapi), Frontend, and Plugin Tools concurrently.                         |
| `yarn build`     | **Build**    | Runs a full clean build of Plugins and Strapi.                                            |
| `yarn codegen`   | **Generate** | Generates TypeScript types for Schema, Content Types, and Components. **Run this first.** |
| `yarn typecheck` | **Check**    | Runs `tsc` across the entire monorepo (0 errors allowed).                                 |
| `yarn lint`      | **Lint**     | Runs ESLint (0 errors, 0 warnings allowed).                                               |
| `yarn test`      | **Test**     | Runs the Vitest suite (Unit + Integration).                                               |
| `yarn cli`       | **CLI**      | Launches the Daicer CLI for data exploration.                                             |

## 🚨 The Iron Gates Protocol (Mandatory)

You **CANNOT** consider a task complete until you pass the Iron Gates in this order:

1.  **Codegen**: `yarn codegen` (Ensures types match Schema)
2.  **Typecheck**: `yarn typecheck` (Ensures Type Safety)
3.  **Lint**: `yarn lint` (Ensures Code Quality)
4.  **Build**: `yarn build` (Ensures Compilation)
5.  **Test**: `yarn test` (Ensures Logic Integrity)

> **Auto-Fix**: If Lint fails, **fix it immediately**. Do not proceed.

## 🧭 Navigation & Knowledge

### Where is the Knowledge?

- **Antigravity Kit**: Deep expert knowledge is in `.gemini/antigravity/`.
  - **Skills**: `.gemini/antigravity/skills/` (e.g., `strapi-engineering`, `frontend-design`).
  - **Reference**: Always check relevant skills before designing complex features.
- **Strapi Docs**: Local Strapi 5 documentation is in `STRAPI_DOC/`.
  - **Rule**: Do not guess Strapi APIs. Read the docs in `STRAPI_DOC/` first.

### Data Access

- **Do NOT guess schemas**: Use `yarn cli schema --type <uid>`.
- **Do NOT guess content**: Use `yarn cli explore --type <uid>`.
- **Do NOT hallucinate game rules**: Use `yarn cli knowledge --query "<term>"`.

## 📂 Project Structure Tips

- **Backend**: `@daicer/backend` (Root directory, acts as the Strapi server).
- **Plugins**: `src/plugins/*` (Modular features, each with its own `package.json`).
- **Libs**: `src/libs/*` (Shared libraries like `@daicer/llm-core`).
- **Legacy Note**: Avoid `src/api` if a Feature Plugin exists for that domain.

## 📦 Dependency Rules

- **Yarn Only**: Use `yarn`, never `npm`.
- **No Phantom Deps**: Each plugin must declare its own dependencies in its `package.json`.
