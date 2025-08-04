// src/utils/promptBuilder.ts
// Builds the prompt for the LLM using system instructions, memory, RAG context, and plugin output
import { Message } from '../agent/sessionMemory';
import { Chunk } from '../rag/rag';
import { PluginResult } from '../plugins/pluginInterface';

export function buildPrompt({
  systemInstructions,
  memory,
  ragChunks,
  pluginResult,
  userMessage,
}: {
  systemInstructions: string;
  memory: Message[];
  ragChunks: Chunk[];
  pluginResult?: PluginResult | null;
  userMessage: string;
}): string {
  let prompt = systemInstructions + '\n';
  if (pluginResult) {
    prompt += `\nPlugin Output (${pluginResult.plugin}):\n${pluginResult.output}\n`;
  }
  if (ragChunks.length) {
    prompt += '\nRelevant Context:\n';
    ragChunks.forEach((chunk, i) => {
      prompt += `Chunk ${i + 1}:\n${chunk.text}\n`;
    });
  }
  if (memory.length) {
    prompt += '\nConversation History:\n';
    memory.forEach(msg => {
      prompt += `[${msg.role}] ${msg.content}\n`;
    });
  }
  prompt += `\n[User] ${userMessage}\n[Agent]`;
  return prompt;
}
