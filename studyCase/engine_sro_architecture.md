# Engine SRO Architecture Study: "The Tight Engine"

> **Objective**: Move from loose JSON-based interfaces and monolithic logic functions to a **Strict, Single Responsibility Object (SRO)** architecture.
> **Philosophy**: Logic belongs to the Object that owns the data. "Reliable, Type-Tight, Granular."

## 1. The Current Problem: "Anemic Domain Model"

Currently, `Entity` is just a data bag (Interface).

- **Damage Logic** resides in `rules/combat.ts` (External to the damage itself).
- **Class Logic** is non-existent (Just a string array `classes: { name: string }[]`).
- **Race Logic** is non-existent (Just `speed` or `size` properties on Entity).

**Consequences**:

- "Spooky Action at a Distance": modifying combat logic breaks spells.
- untestable "God Functions" like `resolveAttack`.
- No enforcement of rules (e.g., "Can a Wizard wear Plate?").

## 2. The Solution: SRO Modules

We will introduce **Rich Domain Models** for the core pillars of RPG mechanics.

### A. The `Damage` Module

**Responsibility**: Encapsulate the _act_ of harming an entity, including calculation, resistance, and type.

```typescript
// src/engine/mechanics/damage/DamageType.ts
export type DamageType = 'fire' | 'cold' | 'slashing' | 'bludgeoning' | ...;

// src/engine/mechanics/damage/DamageInstance.ts
export class DamageInstance {
  constructor(
    public readonly amount: number,
    public readonly type: DamageType,
    public readonly source?: Entity
  ) {}

  /**
   * Pure resolution against a target's defenses
   */
  public resolveAgainst(target: Entity): number {
    if (target.isImmuneTo(this.type)) return 0;
    let final = this.amount;
    if (target.isResistantTo(this.type)) final = Math.floor(final / 2);
    if (target.isVulnerableTo(this.type)) final = final * 2;
    return final;
  }
}
```

### B. The `Class` & `Race` Modules

**Responsibility**: Encapsulate the "Blueprint" logic. Instead of just `name: "Wizard"`, we need a Definition.

```typescript
// src/engine/mechanics/class/ClassDefinition.ts
export interface ClassDefinition {
  name: string;
  hitDie: 'd6' | 'd8' | 'd10' | 'd12';
  savingThrows: Stat[];

  // The SRO Power: Logic Injection
  onLevelUp(entity: Entity, level: number): void;
  getFeatures(level: number): Feature[];
}

// src/engine/mechanics/registry/ClassRegistry.ts
export class ClassRegistry {
  private static classes = new Map<string, ClassDefinition>();
  static register(def: ClassDefinition) { ... }
  static get(name: string): ClassDefinition { ... }
}
```

**Workflow**:

1. Entity has `classes: { name: "Wizard", level: 5 }`.
2. Engine calls `ClassRegistry.get("Wizard").getFeatures(5)`.
3. Returns `[Fireball, Arcane Recovery]` strictly typed.

### C. The `Spell` Module

**Responsibility**: Scaling and Casting logic.

```typescript
// src/engine/mechanics/magic/Spell.ts
export class Spell {
  constructor(public readonly definition: SpellDefinition) {}

  public getDamage(castLevel: number): DamageInstance[] {
    // Logic for "1d6 per level above 3rd" lives HERE, not in a switch statement.
    const base = this.definition.baseDamage;
    const scaling = this.definition.scaling;
    // ... calculation ...
    return [new DamageInstance(total, 'fire')];
  }
}
```

## 3. Implementation Roadmap

1.  **Phase 1: Foundations (`src/engine/mechanics/`)**
    - Create `DamageInstance` and `DamageType`.
    - Create `ResistanceManager` (Attachable to Entity).
2.  **Phase 2: Registry System**
    - Create `ClassRegistry` and `RaceRegistry`.
    - Migrate hardcoded "Rogue Sneak Attack" check to a `Rogue` class definition.
3.  **Phase 3: Refactor Entity**
    - Upgrade `Entity` interface to include helper methods (via mixin or adapter wrapper): `entity.receiveDamage(dmg)`.

## 4. Verification

- **Unit Tests**:
  - `DamageInstance.spec.ts`: Test resist/vuln math in isolation.
  - `ClassRegistry.spec.ts`: Test feature retrieval.
- **Integration**:
  - `Combat.spec.ts`: Rewrite to use `DamageInstance`. Verify "Rage" works via the new `Barbarian` class definition injection, not hardcoded if-checks.

## 5. Why this is "Full Power"

- **Granularity**: You can fix "Fire Damage" without touching "Combat".
- **Power**: New classes (e.g., Homebrew) can be added just by registering a new `ClassDefinition`.
- **Reliability**: Types are strict. `DamageType` is a union, not a string. `Resolve` returns a number, never `NaN`.
