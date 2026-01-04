# Magic System Design

## Core Concept

Spells are Actions with specific costs (Slots, Mana, Cooldowns) and temporal properties (Casting Time, Duration).

## 1. Resource Models

The system supports hybrid resource models:

### Vancian (Slots)

- **Structure**: `slots: [{ level: 1, max: 4, current: 2 }, ...]`.
- **Restoration**: Long Rest (usually).

### Cooldown-Based (MMO Style)

- **Structure**: `cooldowns: { [spellId]: expiryTimestamp }`.
- **Logic**: Spell cannot be cast if `GameTime.totalSeconds < expiryTimestamp`.

### Point-Based (Mana)

- **Structure**: `mana: { current: 50, max: 100 }`.
- **Cost**: Each spell deducts generic points.

## 2. Casting Mechanics

### Casting Time

- **Action**: 1 Action (Instant in turn logic).
- **Bonus Action**: Swift.
- **Ritual**: Adds +10 Minutes to `GameTime`.
- **Channeled**: Requires `Concentration` and multiple turns.

### Duration & Concentration

- **Instant**: Effect happens immediately (Fireball).
- **Duration**: Effect persists for `X` seconds.
  - Engine tracks `activeEffects: [{ id, expiry }]`.
- **Concentration**:
  - Limit: 1 active concentration spell per entity.
  - Break conditions: Damage (Save check), Casting another concentration spell, Sleep.

## 3. Spell Structure

```typescript
interface SpellDefinition {
  id: string;
  name: string;
  level: number;
  school: MagicSchool;
  components: { v: boolean; s: boolean; m?: string };
  castingTime: { type: 'action' | 'bonus' | 'reaction' | 'long'; value?: number };
  duration: { type: 'instant' | 'timed' | 'concentration'; seconds?: number };
  cooldown?: number; // In seconds
}
```

## 4. Implementation Strategy

1. **Cooldown Registry**: Store `lastCastTime` in Entity/Spellbook state.
2. **Validator**: Update `validateSpellCast` to check Cooldowns and Time.
3. **Tick Processor**: `processActiveEffects(entity, timePassed)` to expire buffs/debuffs.
