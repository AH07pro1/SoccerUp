import express from 'express';
import cors from 'cors';
import sessionRoutes from './session/routes/sessionRoutes';
const app = express();

app.use(cors());
app.use(express.json());

// Mount the routes at /api/session
app.use('/api/session', sessionRoutes);

app.listen(3000, () => {
  console.log('✅ Backend running at http://localhost:3000');
});
