import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { processPDFFile, addDocumentChunks, removeDocumentChunks } from '../rag/rag';

const router = Router();
const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DATA_DIR);
  },
  filename: (req, file, cb) => {
    // Use original filename but ensure it's unique with timestamp
    const timestamp = Date.now();
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    cb(null, `${baseName}_${timestamp}${ext}`);
  }
});

// File filter to accept PDF, Markdown, and TXT files
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf') {
    // For PDFs, require strict mimetype
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only valid PDF files are allowed'));
    }
  } else if (ext === '.md' || ext === '.txt') {
    // For .md and .txt, allow by extension regardless of mimetype
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Markdown (.md), and TXT (.txt) files are allowed'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

/**
 * POST /upload
 * Uploads a PDF, Markdown, or TXT file, processes it, and adds its chunks to the RAG system
 */
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or file type not allowed' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;
    const ext = path.extname(fileName).toLowerCase();

    console.log(`Processing uploaded file: ${fileName}`);


    let chunks;
    if (ext === '.pdf') {
      chunks = await processPDFFile(filePath);
    } else if (ext === '.md' || ext === '.txt') {
      // Read the file as text and split into chunks (simple example: by paragraphs)
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      let textChunks = fileContent.split(/\n\n+/g).filter(Boolean);
      if (textChunks.length === 0) {
        // fallback: chunk by 1000 chars
        textChunks = fileContent.match(/.{1,1000}/gs) || [];
      }
      // Wrap each chunk in a Document-like object with required properties
      chunks = textChunks.map(text => ({ pageContent: text, metadata: { filename: fileName } }));
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const addedChunks = await addDocumentChunks(chunks, fileName);

    res.status(200).json({ 
      message: 'File uploaded and processed successfully',
      filename: fileName,
      chunks_count: addedChunks.length
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      error: 'Failed to upload and process file',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * DELETE /upload/:filename
 * Deletes a PDF file and removes its chunks from the RAG system
 */
router.delete('/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(DATA_DIR, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Remove associated chunks from memory
    removeDocumentChunks(filename);
    
    // Delete the file
    fs.unlinkSync(filePath);
    
    res.status(200).json({ 
      message: 'File and associated chunks deleted successfully',
      filename
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      error: 'Failed to delete file',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /upload
 * Lists all uploaded PDF, Markdown, and TXT files
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const allowedExtensions = ['.pdf', '.md', '.txt'];
    const files = fs.readdirSync(DATA_DIR)
      .filter(file => allowedExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => {
        const stats = fs.statSync(path.join(DATA_DIR, file));
        return {
          filename: file,
          size: stats.size,
          uploaded_at: stats.mtime
        };
      });
    res.status(200).json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ 
      error: 'Failed to list files',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;