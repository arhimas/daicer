# Entity Derivation Engine

The "Derivation" layer is responsible for calculating runtime statistics from raw Entity data. It implements the "Core Rules" math.

## Responsibilities

1.  **Attributes**: Calculating Modifiers (`(Score - 10) / 2`).
2.  **Defenses**: Calculating AC (Armor + Dex + Shield + Unarmored Defense) and HP (Hit Dice logic).
3.  **Capabilities**: Calculating Movement Speed (Race + Armor Penalty etc.).
4.  **Skills**: Calculating Skill Bonuses (Attribute + Proficiency).
5.  **Actions (Hydration)**: Converting static Equipment/Spells into playable `RuntimeActions`.
    - e.g., turning a "Longsword" item entry into a `{ attackBonus: +5, damage: 1d8+3 }` action object.

## Usage

```typescript
import { EntityDeriver } from './derivation';

const derived = EntityDeriver.derive(rawEntity);
console.log(derived.ac); // 16
console.log(derived.actions); // [AttackAction...]
```
