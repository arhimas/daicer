# Core Engine Components

The heart of the deterministic simulation loop.

## Components

### `GameLoop`

Manages the "Time" aspect of the simulation. It advances the global clock and executes registered systems (like Entropy) on every tick.

### `DeterministicTurnProcessor`

The "brain" that resolves Actions into State Changes.

- **Input**: Current Game State, List of Actions (Movement, Attacks).
- **Process**: Applies logic strictly sequentially.
- **Output**: New Game State.
- **Purity**: Is completely isolated from Database or Network I/O to ensure Replayability.
