# Engine Resolution

This mechanism sits between the "High Level Rules" and the "Low Level Math".

## Components

- **ActionDispatcher**: Takes a fully hydrated `RuntimeAction` (e.g., "Fireball") and applies it to a target. It orchestrates the flow of:
  1. Attack Rolls
  2. Saving Throws
  3. Effect Triggers (Damage, Conditions)

It returns a `ResolutionResult` which is a "Receipt" of what happened (Log + outcomes), but **does not mutate state directly**. The state mutation happens in the `ActionDispatcher` (Command Handler) level using this result.
