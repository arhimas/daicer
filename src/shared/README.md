
# Shared Library

Code shared strictly between the Backend (Strapi/Node) and Frontend (React).
This directory serves as the **Single Source of Truth** for data contracts, ensuring end-to-end type safety.

## Structure

- **`schemas/`**: Zod schemas for validation and type inference.
- **`events/`**: Action/Event Definitions (formerly Socket.IO contracts, now used for HTTP/SSE payloads).
- **`utils/`**: Isomorphic utilities (e.g., Markdown processing, Rune generation).

## Usage

```typescript
import { EntityUpdateSchema } from '@shared/schemas/contract';
import { generateRoomRunes } from '@shared/utils/room-rune-generator';
```
