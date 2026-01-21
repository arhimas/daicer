
# The Game Engine

This directory contains the runtime engine logic that processes inputs and updates the state.

## Components

### `ActionDispatcher`
The primary entry point for gameplay logic. It implements the "Command Pattern".
- Accepts strict `Command` objects (Move, Attack, CastSpell).
- Validates pre-conditions (Range, Resource Cost).
- Resolves the outcome using deterministic RNG (`Alea`).
- Emits `GameEvents` (Log) and `StateDiff` (Mutation).

This ensures that the "Game Rules" are centralized and not scattered across UI code or API controllers.
