import express from 'express';
import dotenv from 'dotenv';
import agentRoutes from './routes/agent';
import uploadRoutes from './routes/upload';
import cors from 'cors';
import { loadChunks } from './rag/rag';

dotenv.config();
const app = express();
app.use(express.json());

app.use(cors({
  origin: `${process.env.CORS_ORIGIN}`, // or use '*' for all origins (not recommended for production)
  credentials: true // if you need to send cookies or auth headers
}));

app.get('/', (req, res) => {
  res.send('AI RAG Agent Server is running.');
});

app.use('/agent', agentRoutes);
app.use('/upload', uploadRoutes);

const PORT = process.env.PORT || 8000;

(async () => {
  await loadChunks();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
})();
