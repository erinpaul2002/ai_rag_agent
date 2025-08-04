// src/rag/rag.ts
// Basic RAG logic: chunking, embedding (stub), and retrieval
import fs from 'fs';
import path from 'path';

export type Chunk = {
  id: string;
  text: string;
  embedding: number[]; // Placeholder for embedding vector
};

const DATA_DIR = path.join(__dirname, '../../data');
let chunks: Chunk[] = [];

// Simple chunking: split by paragraphs
function chunkText(text: string): string[] {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
}

// Placeholder embedding: returns a vector of text length
function embed(text: string): number[] {
  return [text.length];
}

// Load and chunk all markdown/text files in data/
export function loadChunks() {
  chunks = [];
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
  for (const file of files) {
    const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
    const chunked = chunkText(content);
    chunked.forEach((text, i) => {
      chunks.push({
        id: `${file}#${i}`,
        text,
        embedding: embed(text),
      });
    });
  }
}

// Simple cosine similarity for 1D vectors
function cosineSimilarity(a: number[], b: number[]): number {
  return a[0] && b[0] ? (a[0] * b[0]) / (Math.sqrt(a[0] ** 2) * Math.sqrt(b[0] ** 2)) : 0;
}

// Retrieve top N relevant chunks for a query
export function retrieveRelevantChunks(query: string, topN = 3): Chunk[] {
  const queryEmbedding = embed(query);
  return chunks
    .map(chunk => ({ ...chunk, score: cosineSimilarity(chunk.embedding, queryEmbedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

// Load chunks on startup
loadChunks();
