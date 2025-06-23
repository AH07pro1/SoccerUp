import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all drills
router.get('/', async (req: Request, res: Response) => {
  try {
    const drills = await prisma.drill.findMany();
    res.json(drills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch drills' });
  }
});

// GET drills by session ID
router.get('/session/:sessionId', async (req: Request, res: Response): Promise<any> => {
  const sessionId = parseInt(req.params.sessionId);
  if (isNaN(sessionId)) return res.status(400).json({ error: 'Invalid session ID' });

  try {
    const drills = await prisma.drill.findMany({
      where: { sessionId },
    });
    res.json(drills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch drills for this session' });
  }
});

// POST create a new drill
router.post('/', async (req: Request, res: Response): Promise<any> =>  {
  const {
    drillName,
    duration,
    materials,
    visualReference,
    drillCategory,
    numberOfSets,
    numberOfReps,
    sessionId,
    description,
  } = req.body;

  if (!drillName || !duration || !drillCategory || !numberOfSets || !numberOfReps || !sessionId || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newDrill = await prisma.drill.create({
      data: {
        drillName,
        duration,
        materials,
        visualReference,
        drillCategory,
        numberOfSets,
        numberOfReps,
        sessionId,
        description,
      },
    });
    res.status(201).json(newDrill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create drill' });
  }
});

export default router;
