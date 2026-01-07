# Semantic Search Plugin

State of the Art (SOTA) RAG solution for Daicer, implemented as a dedicated Strapi Plugin.
This plugin provides **Auto-Embedding** (via Lifecycles) and **Vector Search** (via PGVector).

## Project Structure

```
src/plugins/semantic-search/
├── server/
│   ├── config/        # Plugin configuration
│   ├── controllers/   # REST API Controllers (Search, Multimodal)
│   ├── routes/        # Router configuration
│   ├── services/      # Core Logic
│   │   ├── embedding-service.js # OpenAI Integration
│   │   ├── vector-service.js    # Raw SQL PGVector Interfaces
│   │   └── search-service.js    # Orchestrator
│   └── index.js       # Entry point & Lifecycle Registration
├── admin/             # (Optional) Admin Panel UI
└── package.json
```

## How It Works

1.  **Ingestion**:

    - When a configured entity (e.g. `Spell`, `Monster`) is Created/Updated, the **Lifecycle Hook** (in `server/index.js`) triggers.
    - It concatenates relevant fields (e.g. `name + description`) and calls `embedding-service`.
    - `embedding-service` calls OpenAI `text-embedding-ada-002` to get a 1536d vector.
    - The vector is stored in the `embedding` column (PGVector type).

2.  **Search**:
    - Client calls `POST /semantic-search/search` with `{ query: "fireball" }`.
    - `search-service` generates an embedding for "fireball".
    - `vector-service` executes a **Native SQL Query** using the specialized `<=>` cosine distance operator.
    - The results are hydrated via `strapi.entityService` and returned to the client.

## Extending the Plugin

### Adding New Content Types

To enable auto-embedding for a new content type:

1.  Open `server/index.js`.
2.  Add the UID and fields to `registerEmbeddingLifecycles`:
    ```javascript
    const contentTypes = {
      'api::my-new-type.my-new-type': ['title', 'summary'],
    };
    ```
3.  Ensure the Content Type has a `json` or `custom` field named `embedding` in the database (or use `pgvector` migration).

### Switching Vector Provider

To use local embeddings (e.g. BERT) instead of OpenAI:

1.  Modify `services/embedding-service.js`.
2.  Replace `this.openai.embeddings.create` with your local inference call.

## API Reference

### POST `/semantic-search/search`

**Body**:

```json
{
  "query": "fireball",
  "targets": ["spell", "monster"], // Optional: restrict search
  "limit": 5
}
```

**Response**:

```json
{
  "meta": { "count": 1 },
  "data": [
    {
      "id": "12",
      "title": "Fireball",
      "score": 0.89,
      "kind": "entity",
      "entityUid": "api::spell.spell"
    }
  ]
}
```
