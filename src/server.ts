import express from 'express';
import dotenv from 'dotenv';
import agentRoutes from './routes/agent';

dotenv.config();
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('AI RAG Agent Server is running.');
});

app.use('/agent', agentRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
