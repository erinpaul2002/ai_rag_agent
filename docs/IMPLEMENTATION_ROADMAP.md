# Implementation Roadmap: Pluggable AI Agent Server

## 1. Project Initialization
- [ ] Initialize Node.js + TypeScript project (`npm init`, `tsconfig.json`)
- [ ] Set up folder structure (`src/agent`, `src/plugins`, `src/rag`, `src/routes`, `src/utils`, `data/`)
- [ ] Install dependencies: `express`, `dotenv`, TypeScript types, etc.

## 2. Core Backend Setup
- [ ] Create Express server entry point
- [ ] Implement `/agent/message` POST route

## 3. Session Memory
- [ ] Implement in-memory Map for session messages
- [ ] Add logic to store and retrieve messages per `session_id`

## 4. RAG (Retrieval-Augmented Generation)
- [ ] Place at least 5 markdown/text files in `data/`
- [ ] On startup, load and chunk files (by paragraph or similar)
- [ ] Implement embedding logic (OpenAI API or local JS embedding lib)
- [ ] Store chunk vectors in memory
- [ ] On message, embed query and compute cosine similarity to all chunks
- [ ] Retrieve top 3 most similar chunks

## 5. Plugin System
- [ ] Define plugin interface (`run(query: string): Promise<string>`)
- [ ] Implement Weather plugin (API call or mock)
- [ ] Implement Math plugin (safe math expression evaluation)
- [ ] Add intent detection (regex/keyword) to trigger plugins

## 6. Prompt Engineering
- [ ] Write system prompt template (system instructions, last 2 messages, top 3 RAG chunks, plugin output)
- [ ] Integrate with LLM API (OpenAI, Claude, or local)

## 7. Testing & Validation
- [ ] Test end-to-end flow: message → memory → RAG → plugin → prompt → LLM → response
- [ ] Validate input (message, session_id) and error handling

## 8. Deployment & Documentation
- [ ] Prepare for deployment (Railway, Render, Replit, etc.)
- [ ] Add `Procfile` or deployment config if needed
- [ ] Write `README.md` (setup, usage, sample requests)
- [ ] Write `NOTES.md` (AI-generated vs manual code, bugs, design notes)
