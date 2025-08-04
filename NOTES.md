# NOTES.md

## AI-Generated vs Manual Code

- **AI-Generated Code:**
  - Most of the initial scaffolding, boilerplate, and some utility functions were generated with the help of AI tools (e.g., folder structure, TypeScript setup, basic Express server, plugin interface, and some RAG logic).
  - AI was used to suggest code for chunking markdown files, cosine similarity, and prompt engineering templates.
  - Plugin stubs and intent detection logic were also AI-assisted.

- **Manually Written Code:**
  - All business logic, API integration (weather), and math evaluation were reviewed and refined manually.
  - Input validation, error handling, and session management were implemented and tested by hand.
  - All code was reviewed for security, correctness, and maintainability.


## Design Notes

- **Plugin Routing:**
  - The agent uses simple intent detection (regex/keywords) to decide if a plugin should be called. If a plugin is triggered, its output is injected into the LLM prompt.

- **Memory and Context:**
  - The last 2 messages from session memory and the top 3 RAG chunks are always included in the prompt for best context.

- **Extensibility:**
  - New plugins can be added by implementing the plugin interface and registering them in the plugin manager.
  - RAG and agent logic are decoupled for easy maintenance and upgrades.

- **Security:**
  - All user input is validated and sanitized before processing.
  - Math plugin uses safe evaluation to prevent code injection.

## Known Limitations

- In-memory session and vector storage are not persistent; a production system should use a database.
- RAG chunking and embedding are basic and may be improved with more advanced models or libraries.
- Plugin intent detection is simple and may need NLP for more complex use cases.

---
