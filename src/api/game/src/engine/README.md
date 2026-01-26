<div align="center">

# ⚙️ The Daicer Engine (`@daicer/engine`)

**The Pure Logic Core.**

> **Dependency-Free Rulesset & Physics.**
> **Voxel-First Entity Derivation.**

</div>

---

## 🏛 Philosophy

This directory contains the **mathematical acceleration** of the project.
It is a **Shared Library** that knows _nothing_ about Strapi, React, or the Database.
It only knows Math, Rules, and JSON.

**Why?**

- **Portability:** Use the same damage calculation on the Client and Server.
- **Speed:** Unit tests run in milliseconds because there is no DB overhead.
- **Stability:** If the CMS changes, the Physics do not.

---

## 🧩 Modules

### 1. `voxel/` (The Physics)

The heavy lifting of the Voxel World.

- **`Coordinate`**: `x, y, z` struct interfaces.
- **`Chunk`**: The 16x16x8 data structure.
- **`Raycast`**: Pure math implementation of Line-of-Sight.

### 2. `rules/` (The D&D 5e SRD)

The implementation of the OGL Ruleset.

- **`AbilityScores`**: Modifiers (`(Score - 10) / 2`).
- **`Rolling`**: Dice string parsing (`8d6 + 4`).
- **`SavingThrows`**: DC calculations.
- **`Conditions`**: Status effect logic (Blinded, Prone).

### 3. `entropy/` (The Chaos)

The logic for the Entropy System.

- **`EntropyState`**: Class for tracking noise/heat.
- **`Thresholds`**: Logic for determining when an event triggers.

### 4. `derivation/` (The Stat Block)

Code responsible for calculating a final `EntitySheet` from a raw blueprint.

- **`EntityDeriver`**: Merges `Race` + `Class` + `Items` -> `Stats`.

### 5. `compilation/` (The Assembler)

Compiles raw data models into efficient runtime atoms.

---

## 🧪 Testing

This module enforces **100% Logic Coverage**.
Because it has no side effects, every function here should have a corresponding `.spec.ts` file.

```bash
# Run Engine Tests Only
yarn test engine
```
