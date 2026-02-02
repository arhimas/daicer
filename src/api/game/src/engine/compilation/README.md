# Compilation Engine

The "Compilation" system is a validation and hydration layer that runs on Strapi Content Types to ensure they are valid for the Game Engine. It treats static data (CMS entries) as "source code" that needs to be "compiled" into a valid runtime state.

## Architecture

It follows a hierarchical "Genesis" dependency order:

1.  **Atoms**: Basic building blocks (Damage Types, Conditions).
2.  **Molecules**: Logic units (Spells, Features).
3.  **Compounds**: Items and Equipment.
4.  **Blueprints**: Complete Entities (Monsters, NPCs).

## Components

### `CompilationOrchestrator`

The main controller that iterates through Content Types based on the requested Phase. It manages the `compilation_state` component on Strapi entities, marking them as `Valid`, `Invalid`, or `Warning`.

### `Compiler`

The base interface for all logic validators.
