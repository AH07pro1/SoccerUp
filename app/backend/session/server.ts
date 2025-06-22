import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post('/api/session', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionName, drills, objectives, materials } = req.body;
    if (!sessionName) {
      res.status(400).json({ error: 'Session name is required' });
      return;
    }
    const session = await prisma.session.create({
      data: { sessionName, drills, objectives, materials },
    });
    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3000, () => {
  console.log('✅ Backend running at http://localhost:3000');
});
