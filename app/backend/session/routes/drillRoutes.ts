import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../../logger';
import drillSchema from '../drillSchema';

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

router.post('/', async (req: Request, res: Response): Promise<any> => {
  logger.info('📥 Received drill creation request body:', { body: req.body });

  const result = drillSchema.safeParse(req.body);

  if (!result.success) {
    logger.warn('❌ Drill validation failed', { errors: result.error.format() });
    return res.status(400).json({ errors: result.error.format() });
  }

  const validatedData = result.data;

  try {
    const newDrill = await prisma.drill.create({
  data: {
    drillName: validatedData.drillName,
    duration: validatedData.duration,
    numberOfSets: validatedData.numberOfSets,
    numberOfReps: validatedData.numberOfReps,
    description: validatedData.description,
    visualReference: validatedData.visualReference,
    drillCategory: validatedData.drillCategory,
    materials: validatedData.materials,
    createdByUser: validatedData.createdByUser,
  },
});


    logger.info('✅ Drill created successfully', { drillId: newDrill.id });
    res.status(201).json(newDrill);
  } catch (err) {
    logger.error('❌ Failed to create drill', { error: err });
    res.status(500).json({ error: 'Failed to create drill' });
  }
});


export default router;
