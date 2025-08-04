# Instructions for AI Code Agent

Welcome! This file provides clear instructions for using an AI code agent to help build and maintain the Pluggable AI Agent Server project. Please follow these guidelines to ensure effective collaboration and high-quality results.

## 1. Project Context
- This project is a TypeScript (Node.js) backend for a pluggable AI agent with RAG (Retrieval-Augmented Generation), session memory, and a plugin system.
- The system uses Express.js, OpenAI (or similar LLM), and a custom vector search for RAG.
- See `docs/IMPLEMENTATION_ROADMAP.md`, `docs/SIMPLE_IMPLEMENTATION_PLAN.md`, and `docs/SYSTEM_DESIGN.md` for architecture and requirements.

## 2. Coding Standards
- Use TypeScript types everywhere.
- Modularize code: separate agent, plugins, RAG, and utility logic.
- Use async/await for all I/O.
- Validate all inputs (e.g., message, session_id).
- Add comments and clear function names.

## 3. Folder Structure
- Follow the structure outlined in the design docs:
  - `src/agent/` — Session memory, agent logic
  - `src/plugins/` — Plugin interface and implementations
  - `src/rag/` — Embedding, chunking, vector search
  - `src/routes/` — Express route handlers
  - `src/utils/` — Utility functions (e.g., cosine similarity)
  - `data/` — Markdown/text files for RAG

## 4. Implementation Guidelines
- Implement `/agent/message` POST endpoint.
- Store and retrieve messages per session_id.
- On each message, embed the query and retrieve top 3 relevant chunks from RAG.
- Detect plugin intent and run plugins as needed (weather, math, etc.).
- Build prompts including system instructions, memory, RAG context, and plugin output.
- Integrate with OpenAI or compatible LLM API.

## 5. Documentation & Testing
- Write clear, concise documentation for setup, usage, and sample requests.
- Add a `NOTES.md` file to distinguish AI-generated vs. manual code, bugs, and design notes.
- Test the end-to-end flow and validate error handling.

## 6. Extensibility
- Ensure plugins are pluggable via interface.
- Keep RAG and agent logic decoupled.
- Make it easy to add new plugins or swap LLM/vector logic.

---

For more details, refer to the roadmap and design documents in the `docs/` folder. If you have questions, consult the documentation or ask for clarification.
