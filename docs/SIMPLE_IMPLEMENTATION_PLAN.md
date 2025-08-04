## Simple & Effective Implementation Plan for Pluggable AI Agent Server

### 1. Project Setup
- Use **TypeScript** with **Express.js** for the backend server.
- Organize code into folders: `src/agent`, `src/plugins`, `src/rag`, `src/routes`, `src/utils`.
- Use `dotenv` for config, `tsconfig.json` for TypeScript settings.

### 2. Core Features Breakdown

#### a. Agent Core (Session Memory)
- Create `/agent/message` POST endpoint.
- Store messages per `session_id` in an in-memory Map (or simple JSON DB for demo).

#### b. RAG (Retrieval-Augmented Generation)
- Place at least 5 markdown/text files in a `data/` folder.
- On startup, split files into chunks (e.g., by paragraph).
- Use a simple embedding model (OpenAI API or a local JS embedding lib) to vectorize chunks.
- On each message, embed the query and compute cosine similarity to all chunks.
- Retrieve top 3 most similar chunks.

#### c. Plugin System
- Define a plugin interface: each plugin gets a query and returns a result.
- Implement two plugins:
  1. **Weather Plugin**: Call a public weather API (or mock response for demo).
  2. **Math Plugin**: Parse and evaluate math expressions safely.
- Add simple intent detection (regex or keyword match) to trigger plugins.

#### d. Prompt Engineering
- Write a system prompt template that includes:
  - System instructions
  - Last 2 messages from session
  - Top 3 RAG chunks
  - Plugin output (if any)
- Fill the template and send to OpenAI (or Claude/local LLM).

### 3. Code Quality & Best Practices
- Use TypeScript types everywhere.
- Modularize code (separate agent, plugins, RAG logic).
- Add comments and clear function names.
- Use async/await for all I/O.
- Validate inputs (message, session_id).

### 4. Deployment
- Use Railway, Render, or Replit for quick hosting.
- Add a `Procfile` or deployment config as needed.

### 5. Documentation
- Write a `README.md` with setup, usage, and sample requests.
- Add a `NOTES.md` for AI-generated vs. manual code, bugs, and design notes.

---

## Example File Structure

```
src/
  agent/
    index.ts
  plugins/
    weather.ts
    math.ts
    index.ts
  rag/
    embed.ts
    search.ts
  routes/
    agent.ts
  utils/
    cosine.ts
data/
  file1.md
  ...
README.md
NOTES.md
```

---

## Implementation Steps (Checklist)

- [ ] Initialize Node.js + TypeScript project
- [ ] Set up Express server and `/agent/message` route
- [ ] Implement session memory (in-memory Map)
- [ ] Load and chunk markdown files, embed and store vectors
- [ ] Implement cosine similarity search for RAG
- [ ] Build plugin interface and two plugins (weather, math)
- [ ] Add intent detection for plugin calls
- [ ] Write prompt template and integrate with LLM API
- [ ] Test end-to-end flow
- [ ] Deploy and document
