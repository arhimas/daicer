
# Entropy System

A deterministic simulation of "Narrative Variance" and "World Events".

## Concept
Instead of a static world, the Entropy System simulates a living environment by tracking "Conditions" and an "Entropy Pool".
- **Conditions**: States like Weather, Political Climate, or Mana Stability.
- **Entropy Pool**: A float (0.0 - 1.0) that rises over time.

## Mechanics
1. **Accumulation**: Every turn (or time tick), the Entropy Pool increases.
2. **Trigger**: On each tick, a check is made against the current Pool.
3. **Release**: If the check passes:
   - A **Mutation** occurs (Weather changes from Clear to Rain).
   - Or a **Random Event** triggers (A merchant arrives).
   - The Pool is drained (Tension release).

This guarantees that "Something will happen eventually", preventing the game from feeling stale during long periods of inactivity.
