import express from 'express';
import dotenv from 'dotenv';
import agentRoutes from './routes/agent';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', // or use '*' for all origins (not recommended for production)
  credentials: true // if you need to send cookies or auth headers
}));

app.get('/', (req, res) => {
  res.send('AI RAG Agent Server is running.');
});

app.use('/agent', agentRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
