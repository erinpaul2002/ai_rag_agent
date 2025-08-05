// src/agent/llm.ts
// OpenAI API integration for LLM completion
import { config } from 'dotenv';
config();

import { azureOpenAIChatClient } from '../utils/azureOpenAIUtils';

/**
 * Calls the LLM with a fully constructed prompt including system instructions, memory, RAG context, and plugin outputs.
 * @param userMessage The user's message for the LLM.
 * @param memorySummary Summary of the last 2 messages in the session.
 * @param retrievedChunks Top 3 relevant chunks from the knowledge base.
 * @param pluginOutputs Outputs from any plugins used (weather, math, etc.).
 */
export async function callLLM(
  userMessage: string,
  memorySummary: string = '',
  retrievedChunks: string = '',
  pluginOutputs: string = ''
): Promise<string> {
  // Build the improved system prompt
  const systemPrompt = `You are an advanced AI agent designed to assist users with technical and general queries. Your responses should be clear, accurate, and concise. You have access to the following context for each session:\n\n- Session Memory: Here are the last two messages in this conversation:\n${memorySummary ? memorySummary : 'No previous messages.'}\n\n- Retrieved Knowledge: The following information was retrieved from internal documents and knowledge base to help answer the user's question:\n${retrievedChunks ? retrievedChunks : 'No relevant knowledge retrieved.'}\n\n- Plugin Outputs: If any tools or plugins were used (such as weather or math), their results are provided here:\n${pluginOutputs ? pluginOutputs : 'No plugin outputs.'}\n\nInstructions:\n- Use the session memory to maintain context and continuity.\n- Use the retrieved knowledge to provide accurate, relevant, and up-to-date answers.\n- If plugin outputs are present, incorporate their results directly and clearly into your response.\n- If you do not know the answer, say so honestly.\n- Do not fabricate information.\n- Format code and technical explanations for easy understanding.\n- Always be helpful, friendly, and professional.`;

  const messages: import('openai/resources/chat/completions').ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];
  const response = await azureOpenAIChatClient.chatCompletion(messages);
  console.log('LLM Response:', response);
  return response;
}
