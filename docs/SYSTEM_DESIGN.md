# System Design: Pluggable AI Agent Server

## 1. High-Level Architecture

- **Express.js Server (TypeScript)**
  - Handles HTTP requests and routes.
- **Session Memory**
  - In-memory Map to store messages per `session_id`.
- **RAG (Retrieval-Augmented Generation)**
  - Loads and chunks markdown/text files from a data folder.
  - Embeds chunks and stores vectors in memory.
  - On each message, embeds the query and retrieves top 3 similar chunks using cosine similarity.
- **Plugin System**
  - Plugin interface for extensibility.
  - Weather and Math plugins (intent detected via regex/keywords).
- **Prompt Engineering**
  - System prompt template includes: system instructions, last 2 messages, top 3 RAG chunks, plugin output.
  - Sends prompt to LLM (OpenAI API or similar).

---

## 2. Folder Structure

```
src/
  agent/      # Session memory, agent logic
  plugins/    # Plugin interface and implementations
  rag/        # Embedding, chunking, vector search
  routes/     # Express route handlers
  utils/      # Utility functions (cosine similarity, etc.)
data/         # Markdown/text files for RAG
```

---

## 3. Component Breakdown

### a. Agent Core
- `POST /agent/message`
- Validates input, manages session memory, orchestrates RAG and plugins, builds prompt, calls LLM, returns response.

### b. RAG
- On startup: Loads, chunks, and embeds files.
- On message: Embeds query, computes cosine similarity, retrieves top 3 chunks.

### c. Plugins
- Interface: `run(query: string): Promise<string>`
- Weather plugin: Calls API or returns mock.
- Math plugin: Safely evaluates math expressions.

### d. Prompt Engineering
- Template includes:
  - System instructions
  - Last 2 session messages
  - Top 3 RAG chunks
  - Plugin output (if any)

---

## 4. Data Flow

1. User sends `POST /agent/message` with message and session_id.
2. Server stores message in session memory.
3. Server embeds message, retrieves top 3 RAG chunks.
4. Server detects intent, runs plugin if needed.
5. Server builds prompt with all context.
6. Server sends prompt to LLM, gets response.
7. Server stores response in session memory and returns it.

---

## 5. Extensibility & Best Practices

- All logic is modular and typed.
- Plugins are pluggable via interface.
- RAG and agent logic are decoupled.
- Easy to add new plugins or swap LLM/vector logic.
