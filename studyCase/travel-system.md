# Travel System Design

## Core Concept

The **Travel System** is the bridge between locations, converting spatial movement into **Time** and **Bio-Necessity Decay**. It operates in a "Montage" mode where the rigorous 6-second round structure is suspended in favor of variable time slices based on distance and pace.

## 1. Travel Phases

1.  **Proposal Phase**:
    - Players (or Leader) propose a destination.
    - Engine calculates estimated _Distance_ and _Time_ based on chosen route/pace.
    - Party "Votes" or "Agrees" (Simple majority or Leader override).
2.  **Journey Phase (The Montage)**:
    - The Engine calculates the delta: `TotalTime = Distance / Pace`.
    - The LLM generates a narrative description of the journey (sights, weather, banter).
    - _Optional_: Random Encounters (pauses travel, enters Combat Mode).
3.  **Arrival Phase**:
    - Time is advanced by `TotalTime`.
    - Bio-necessities decay by `TotalTime`.
    - Players arrive at the new location (Room/Scene).

## 2. Mechanics

### Pace Options (D&D 5e Standard)

| Pace       | Speed (MPH) | Effect                                  |
| :--------- | :---------- | :-------------------------------------- |
| **Fast**   | 4 mph       | -5 to Passive Perception (Ambush risk). |
| **Normal** | 3 mph       | Standard travel.                        |
| **Slow**   | 2 mph       | Allows Stealth.                         |

### Forced March

Traveling more than 8 hours in a day risks **Exhaustion**.

- Constitution Save (DC 10 + 1 per extra hour).
- Failure: Gain 1 level of Exhaustion.

## 3. Integration with Time System

The mechanics are purely mathematical derivations.

```typescript
function calculateTravel(distanceMiles: number, pace: 'fast' | 'normal' | 'slow') {
  const speeds = { fast: 4, normal: 3, slow: 2 };
  const speed = speeds[pace];
  const durationHours = distanceMiles / speed;
  return {
    durationSeconds: durationHours * 3600,
    biodecayTicks: durationHours, // e.g. 1 tick per hour
  };
}
```

## 4. The Loop

1.  **User**: "Let's head to the Goblin Cave (Slowly, trying to be sneaky)."
2.  **LLM**: Analyzes intent -> Calls `travel_tool({ destination: 'Goblin Cave', pace: 'slow' })`.
3.  **Engine**:
    - Calculates path/distance.
    - Computes duration (e.g., 4 hours).
    - Advances `GameTime.totalSeconds` +14,400.
    - Applies 4 hours of Hunger/Thirst decay.
4.  **LLM**: Receives result `{ traveled: true, timePassed: '4h', events: [] }`.
5.  **LLM**: Narrates: "You creep through the forest for four hours, staying off the main path. The sun begins to set as you arrive..."

## 5. UI Representation

- **Travel Widget**: Shows a progress bar or map overlay during the "Montage".
- **Time Dial**: Spins forward visually to represent passing time.
- **Resource Drain**: Pop-ups showing food/water consumption or "Hungry" status updates upon arrival.
