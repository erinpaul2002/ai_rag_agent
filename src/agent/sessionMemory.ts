// src/agent/sessionMemory.ts
// Simple in-memory session memory store for agent conversations

export type Message = {
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
};

const sessions: Record<string, Message[]> = {};

export function getSessionMessages(sessionId: string): Message[] {
  return sessions[sessionId] || [];
}

export function addSessionMessage(sessionId: string, message: Message): void {
  if (!sessions[sessionId]) {
    sessions[sessionId] = [];
  }
  sessions[sessionId].push(message);
}
