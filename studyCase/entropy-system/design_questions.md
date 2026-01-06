# 🎲 Architecture Questions: The Entropy System

> **Status**: Draft
> **Domain**: System Design / Narrative Pacing
> **Dependencies**: Solid Base (Ledger), Time Machine (History)

To ensure the **Entropy System** integrates flawlessly with our SOTA "Time Machine" architecture, we need to clarify the following 20 architectural decisions.

## 1. Determinism & Time Travel

1.  **Replay Consistency**: If a user rewinds time to 12:00 PM and replays to 4:00 PM, must the _exact same_ Entropy Event (e.g., "Bandit Ambush") trigger again? (Implies seeding RNG with Ledger Event ID).
2.  **Entropy State in Snapshots**: Should the `EntropyPool` value be stored in the `TimeFrame` snapshot? Or is it re-calculated on the fly by replaying events?
3.  **Branching Timelines**: If a user "Steps In" and changes an action at 1:00 PM, does this fork a new Entropy Seed? Or do we try to preserve the "Future Events" as much as possible?

## 2. State & Storage

4.  **Ownership**: Where does `EntropyState` live? Is it a property of the `Room`, the `World`, or individual `Regions/Chunks`? (Global vs Local chaos).
5.  **Persistence**: Is the Entropy Pool persisted to the Database on every tick? Or only on significant changes (Events)?
6.  **Granularity**: Does the pool track `float` (continuous decay/growth) or `integer` values?

## 3. Triggers & Mechanics

7.  **Noise Definition**: Exactly _which_ actions generate entropy? Do we need an `entropyCost` field in the `ActionDefinitionSchema`?
8.  **Passive Decay**: Does entropy decay if players sit still and meditate? Or is peace "unstable" (always growing)?
9.  **Combat Coupling**: Does _every round_ of combat generate entropy? Or just the _initiation_ of combat? (Risk of "Death Spiral" if combat generates combat).
10. **The "Crit Fail"**: Does a natural 1 on the d100 check override a low pool? (Chaos Theory).

## 4. Event Resolution (The "Weird Stuff")

11. **Instantiation**: When an event like "Bandit Ambush" triggers, does the engine _automatically_ spawn Monster Entities? Or does it just send a "Prompt" to the DM/LLM?
12. **LLM Agency**: Does the Engine pick the event (e.g., `TABLE_WILDERNESS_ENCOUNTER_3`), or does the Engine just signal "HIGH ENTROPY" and let the LLM hallucinate the event?
13. **Narrative Integrity**: How do we prevent events that contradict the current narrative? (e.g., "Rain Storm" triggering inside a "Volcano").
14. **Safety Valves**: Are there "Safe Zones" (e.g., Taverns, Temples) where entropy mechanics are suspended?

## 5. Player Experience & Feedback

15. **Visibility**: Is the Entropy Pool visible to players? (e.g., a "Doom Meter"). Or hidden (DM only)?
16. **Player Agency**: Can players perform rituals/actions specifically to _lower_ entropy? (e.g., "Calm Emotions" spell).
17. **Feedback**: How does the player know entropy is rising? Audio cues? Subtle text changes ("The wind howls louder...")?

## 6. Integration & Performance

18. **Time Jumps**: If the players `Long Rest` (8 hours), do we simulate 8 hours of entropy ticks (expensive)? Or use a "Bulk Formula"?
19. **Performance**: With the `GameLoop` running at 60 ticks/second (conceptually) or discrete steps, is entropy checked every tick? Or every `N` seconds?
20. **Webhooks**: Should Entropy Events trigger client-side effects (Frontend Shake, Sound Effect) via the Socket?
