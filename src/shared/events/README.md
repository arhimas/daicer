# Shared Event Contracts

Defines the real-time event protocol between the backend and frontend using Zod schemas. This ensures strictly typed websocket communication.

## Key Contracts

### `contract.ts`

The primary definition of Socket.IO event payloads:

- **`SocketEventSchema`**: A discriminated union of all possible events (`entities:update`, `turn:processing`, `game:update`).
- **`EntityUpdateSchema`**: The standardized format for synchronizing entity state (Hp, Position, Actions) to the client.
- **`MessagePayloadSchema`**: Contract for chat messages (System, User, Assistant).
