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
        restTime: validatedData.restTime,
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

// PUT update a drill
router.put('/:id', async (req: Request, res: Response): Promise<any> => {
  const drillId = parseInt(req.params.id);
  if (isNaN(drillId)) return res.status(400).json({ error: 'Invalid drill ID' });

  const result = drillSchema.safeParse(req.body);

  if (!result.success) {
    logger.warn('❌ Validation failed:', result.error.format());
    return res.status(400).json({ errors: result.error.format() });
  }

  // Exclude createdByUser from being updated
  const { createdByUser, ...data } = result.data;

  logger.info('🔄 Updating drill ID', drillId.toString(), 'with data:', data);

  try {
    const updatedDrill = await prisma.drill.update({
      where: { id: drillId },
      data,
    });
    logger.info('✅ Updated drill:', updatedDrill);
    res.status(200).json(updatedDrill);
  } catch (err) {
    logger.error('❌ Prisma update failed:', err);
    res.status(500).json({ error: 'Failed to update drill' });
  }
});

// DELETE a drill
router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
  const drillId = parseInt(req.params.id);
  if (isNaN(drillId)) return res.status(400).json({ error: 'Invalid drill ID' });

  try {
    await prisma.drill.delete({ where: { id: drillId } });
    res.status(204).send(); // No Content
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete drill' });
  }
});

export default router;
