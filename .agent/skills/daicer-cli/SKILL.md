---
name: daicer-cli
description: API for the Agent to interact with the Daicer Backend via CLI.
---

# Daicer CLI Skill

Use this skill to inspect the backend state, schemas, and knowledge base without needing to read raw files.

## Instructions

Use `yarn cli` with the following subcommands based on user intent.

### 1. Check Status
*   **Intent**: "Is the backend running?", "Check connection"
*   **Command**: `yarn cli status`

### 2. Inspect Schemas
*   **Intent**: "Show me the User schema", "What fields does an Item have?"
*   **Command**: `yarn cli schema [uid]`
    *   *Example*: `yarn cli schema plugin::users-permissions.user`
    *   *Example*: `yarn cli schema api::item.item`

### 3. Query Knowledge (RAG)
*   **Intent**: "What do we know about Voxel implementation?", "Search knowledge base"
*   **Command**: `yarn cli knowledge "[query]"`
    *   *Example*: `yarn cli knowledge "voxel chunk architecture"`

### 4. Genesis / Seeding
*   **Intent**: "Reseed the database", "Run genesis"
*   **Command**: `yarn cli genesis` (Use with caution, usually wipes data)

## Notes
*   Avoid interactive modes (like just `yarn cli explore`) unless you are sure you can handle the TTY output or the user asked to run it in a terminal they can see.
*   For `yarn cli schema`, if you don't know the UID, try listing them or guessing based on standard naming (api::[name].[name]).
