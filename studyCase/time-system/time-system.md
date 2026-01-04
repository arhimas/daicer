# Time System Design

## Core Concept

The Game Engine will track a precise **Global Timestamp** (integers representing seconds or ticks) that drives all celestial events, cooldowns, and regeneration logic.

## 1. The Clock

- **Unit**: Seconds (Base Unit).
- **Scale**:
  - **Round**: 6 Seconds.
  - **Minute**: 10 Rounds (60s).
  - **Hour**: 60 Minutes (3600s).
  - **Day**: 24 Hours (86400s).

### State Model

```typescript
interface GameTime {
  totalSeconds: number; // Absolute time from campaign start
  day: number; // Derived
  hour: number; // Derived (0-23)
  minute: number; // Derived (0-59)
  isDaytime: boolean; // Derived from sun logic
}
```

## 2. Day/Night Cycle

- **Sun Logic**: Calculated based on `GameTime`.
- **Lighting**:
  - `Dawn` (06:00): Light ramps up.
  - `Noon` (12:00): Peak brightness.
  - `Dusk` (18:00): Light ramps down.
  - `Midnight` (00:00): Peak darkness.

## 3. Time Modes

The game switches between **Combat Time** (Turn-based) and **World Time** (Fluid).

### Combat Time (Tactical)

- Time advances in **6-second increments** independent of real-time.
- Every completed Round adds +6s to `totalSeconds`.

### World Time (Exploration)

- Time advances based on **Action Cost**.
- **Short Rest**: Advances +1 Hour.
- **Long Rest**: Advances +8 Hours.
- **Travel**: Advances `distance / speed`.

## 4. Implementation Strategy

1. **Engine**: Add `time` module to `GameResult`.
2. **Backend**: Persist `totalSeconds` in `Room` state.
3. **Frontend**: Display clock widget and Sun/Moon UI.
