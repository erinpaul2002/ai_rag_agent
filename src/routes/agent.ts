import { Router, Request, Response } from 'express';
import { addSessionMessage, getSessionMessages, Message } from '../agent/sessionMemory';
import { retrieveRelevantChunks } from '../rag/rag';
import { detectAndRunPlugin } from '../plugins/pluginManager';
import { buildPrompt } from '../utils/promptBuilder';
import { callLLM } from '../agent/llm';

const router = Router();

/**
 * POST /agent/message
 * Body: { session_id: string, message: string }
 * Returns: { response: string }
 */
router.post('/message', async (req: Request, res: Response) => {
  const { session_id, message } = req.body;
  if (typeof session_id !== 'string' || typeof message !== 'string') {
    return res.status(400).json({ error: 'session_id and message are required.' });
  }

  // Store user message
  addSessionMessage(session_id, {
    role: 'user',
    content: message,
    timestamp: Date.now(),
  });

  // Retrieve session history (for demonstration)
  const history: Message[] = getSessionMessages(session_id);

  // Plugin intent detection and execution
  const pluginResult = await detectAndRunPlugin(message);

  // Retrieve top 3 relevant RAG chunks
  const ragChunks = retrieveRelevantChunks(message, 3);

  // Build LLM prompt
  const systemInstructions = 'You are a helpful AI agent. Answer user questions using the provided context and plugins.';
  const prompt = buildPrompt({
    systemInstructions,
    memory: history,
    ragChunks,
    pluginResult,
    userMessage: message,
  });

  // Call LLM for response
  let llmResponse: string;
  try {
    llmResponse = await callLLM(prompt);
  } catch (err) {
    llmResponse = 'Error calling LLM: ' + (err instanceof Error ? err.message : String(err));
  }

  // Store agent response
  addSessionMessage(session_id, {
    role: 'agent',
    content: llmResponse,
    timestamp: Date.now(),
  });

  res.json({ response: llmResponse, history, ragChunks, pluginResult, prompt });
});

export default router;
