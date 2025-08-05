// src/rag/rag.ts
// Enhanced RAG logic with improved chunking and PDF support
import fs from 'fs';
import path from 'path';
import { azureOpenAIEmbedClient } from '../utils/azureOpenAIUtils';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { Document } from 'langchain/document';

export type Chunk = {
  id: string;
  text: string;
  metadata: {
    source: string;
    page?: number;
  };
  embedding: number[];
};

const DATA_DIR = path.join(__dirname, '../../data');
let chunks: Chunk[] = [];

// Enhanced chunking using LangChain's RecursiveCharacterTextSplitter
async function splitTextWithLangChain(text: string, source: string): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  
  return splitter.createDocuments([text], [{ source }]);
}

// Load and process a text or markdown file
async function processTextFile(filePath: string, fileName: string): Promise<Document[]> {
  const content = fs.readFileSync(filePath, 'utf8');
  return splitTextWithLangChain(content, fileName);
}

// Load and process a PDF file - now exported for use in upload route
export async function processPDFFile(filePath: string): Promise<Document[]> {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();
  
  // Further split PDF docs if they're too large
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  
  return splitter.splitDocuments(docs);
}

// Add document chunks to the in-memory store - new function for upload
export async function addDocumentChunks(docs: Document[], source: string): Promise<Chunk[]> {
  if (!docs.length) {
    return [];
  }
  
  // Extract texts for embedding
  const allTexts = docs.map(doc => doc.pageContent);
  
  // Embed all chunks in batch
  console.log(`Embedding ${allTexts.length} chunks from ${source}...`);
  const embeddings = await azureOpenAIEmbedClient.embed(allTexts);
  
  // Create new chunks with embeddings
  const newChunks = docs.map((doc, i) => ({
    id: `${source}#${i}`,
    text: doc.pageContent,
    metadata: {
      source,
      page: doc.metadata.page || undefined,
    },
    embedding: embeddings[i] || [],
  }));
  
  // Add new chunks to the in-memory store
  chunks = [...chunks, ...newChunks];
  console.log(`Added ${newChunks.length} new chunks from ${source} to the system.`);
  
  // Save chunks to JSON file for persistence
  await saveChunksToJson();
  
  return newChunks;
}

// Remove document chunks from the in-memory store - new function for delete
export function removeDocumentChunks(source: string): void {
  const initialCount = chunks.length;
  chunks = chunks.filter(chunk => !chunk.metadata.source.includes(source));
  const removedCount = initialCount - chunks.length;
  console.log(`Removed ${removedCount} chunks for source: ${source}`);
  
  // Save updated chunks to JSON for persistence
  saveChunksToJson();
}

// Save chunks to JSON file for persistence - new function
async function saveChunksToJson(): Promise<void> {
  const chunksFile = path.join(DATA_DIR, 'chunks.json');
  try {
    // Format chunks for storage (we might want to compress embeddings for storage)
    const storageFormat = chunks.map(chunk => ({
      ...chunk,
      embedding: chunk.embedding // For simplicity storing full embeddings, could be compressed
    }));
    
    await fs.promises.writeFile(
      chunksFile,
      JSON.stringify(storageFormat, null, 2)
    );
    console.log(`Saved ${chunks.length} chunks to ${chunksFile}`);
  } catch (error) {
    console.error('Error saving chunks to JSON:', error);
  }
}

// Load chunks from JSON file - new function
async function loadChunksFromJson(): Promise<boolean> {
  const chunksFile = path.join(DATA_DIR, 'chunks.json');
  
  try {
    if (fs.existsSync(chunksFile)) {
      const data = await fs.promises.readFile(chunksFile, 'utf8');
      const savedChunks = JSON.parse(data);
      if (Array.isArray(savedChunks) && savedChunks.length > 0) {
        chunks = savedChunks;
        console.log(`Loaded ${chunks.length} chunks from ${chunksFile}`);
        return true;
      }
    }
  } catch (error) {
    console.error('Error loading chunks from JSON:', error);
  }
  
  return false;
}

// Load and chunk all supported files in data/ and embed them
export async function loadChunks() {
  console.log("Loading and embedding chunks from data directory...");
  
  // First try to load from JSON cache
  const loadedFromCache = await loadChunksFromJson();
  if (loadedFromCache && chunks.length > 0) {
    console.log(`Using ${chunks.length} cached chunks from JSON file.`);
    return chunks;
  }
  
  // If no cache or empty, process files
  chunks = [];
  const files = fs.readdirSync(DATA_DIR);
  
  let allDocs: Document[] = [];
  
  // Process all files
  for (const file of files) {
    // Skip the chunks.json file
    if (file === 'chunks.json') continue;
    
    const filePath = path.join(DATA_DIR, file);
    
    try {
      if (file.endsWith('.pdf')) {
        const pdfDocs = await processPDFFile(filePath);
        allDocs = [...allDocs, ...pdfDocs.map(doc => ({
          ...doc,
          metadata: { ...doc.metadata, source: file }
        }))];
        console.log(`Processed PDF: ${file} (${pdfDocs.length} chunks)`);
      } else if (file.endsWith('.md') || file.endsWith('.txt')) {
        const textDocs = await processTextFile(filePath, file);
        allDocs = [...allDocs, ...textDocs];
        console.log(`Processed text file: ${file} (${textDocs.length} chunks)`);
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }
  
  // Extract texts for embedding
  const allTexts = allDocs.map(doc => doc.pageContent);
  
  // Embed all chunks in batch (if there are any)
  if (allTexts.length > 0) {
    console.log(`Embedding ${allTexts.length} chunks...`);
    const embeddings = await azureOpenAIEmbedClient.embed(allTexts);
    
    // Create the final chunks array with embeddings
    chunks = allDocs.map((doc, i) => ({
      id: `${doc.metadata.source}#${i}`,
      text: doc.pageContent,
      metadata: {
        source: doc.metadata.source,
        page: doc.metadata.page || undefined,
      },
      embedding: embeddings[i] || [],
    }));
    
    console.log(`Successfully embedded ${chunks.length} chunks.`);
    
    // Save to JSON for future use
    await saveChunksToJson();
  } else {
    console.log("No documents found to process.");
  }
  
  return chunks;
}

// Cosine similarity for multi-dimensional vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

// Retrieve top N relevant chunks for a query (async)
export async function retrieveRelevantChunks(query: string, topN = 3): Promise<Chunk[]> {
  console.log(`Retrieving relevant chunks for query: "${query}"`);
  
  if (chunks.length === 0) {
    console.log("No chunks available. Loading chunks first...");
    await loadChunks();
  }
  
  try {
    const [queryEmbedding] = await azureOpenAIEmbedClient.embed([query]);
    
    const rankedChunks = chunks
      .map(chunk => ({ 
        ...chunk, 
        score: cosineSimilarity(chunk.embedding, queryEmbedding) 
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
    
    console.log(`Retrieved ${rankedChunks.length} relevant chunks.`);
    return rankedChunks;
  } catch (error) {
    console.error("Error retrieving relevant chunks:", error);
    return [];
  }
}
