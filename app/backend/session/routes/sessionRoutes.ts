import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sessionSchema from '../sessionSchema';
import logger from '../../logger';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
   const sessions = await prisma.session.findMany({
  include: { drills: true },
  orderBy: { createdAt: 'desc' },
});

    res.status(200).json(sessions);
  } catch (error) {
    logger.error('Error fetching sessions', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//get a specific session by ID
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  const sessionId = parseInt(req.params.id);

  if (isNaN(sessionId)) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { drills: true },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.status(200).json(session);
  } catch (error) {
    logger.error('Error fetching session by ID', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/', async (req: Request, res: Response): Promise<any> => {
  const result = sessionSchema.safeParse(req.body);
  logger.info("📥 Received session creation request body:", { body: req.body });

 if (!result.success) {
  logger.warn("Validation errors", { errors: result.error.format() });
  return res.status(400).json({
    errors: result.error.format(),  // send the full structured error object
  });
}



  try {
    const validatedData = result.data;

   const session = await prisma.session.create({
  data: {
    sessionName: validatedData.sessionName,
    objectives: validatedData.objectives,
    materials: validatedData.materials ?? [],
  drills: {
  create: validatedData.drills.map((drill: any) => ({
    drillName: drill.drillName,
    duration: drill.duration,
    restTime: drill.restTime,
    numberOfSets: drill.numberOfSets,
    numberOfReps: drill.numberOfReps,
    drillCategory: drill.drillCategory,
    materials: drill.materials || [],
    description: drill.description || '',
    basedOnName: drill.basedOnName || null, // Optional field for variants
  })),
},
     scheduledDate: validatedData.scheduledDate
  },
});
    logger.info('Session created', { sessionId: session.id });  // <-- log success info

    res.status(201).json(session);
  } catch (error) {
    logger.error('Error creating session', { error });  // <-- log error with details
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT update a session (except drills)
router.put('/:id', async (req: Request, res: Response): Promise<any> => {
  const sessionId = parseInt(req.params.id);
  if (isNaN(sessionId)) return res.status(400).json({ error: 'Invalid session ID' });

  const result = sessionSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.format() });
  }

  try {
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        sessionName: result.data.sessionName,
        objectives: result.data.objectives,
        materials: result.data.materials ?? [],
        scheduledDate: result.data.scheduledDate,
      },
    });
    res.status(200).json(updatedSession);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update session' });
  }
});


// DELETE a session (and its drills)
router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
  const sessionId = parseInt(req.params.id);
  if (isNaN(sessionId)) return res.status(400).json({ error: 'Invalid session ID' });

  try {
    await prisma.drill.deleteMany({ where: { sessionId } });
    await prisma.session.delete({ where: { id: sessionId } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

//this is to update  a drill within a session

router.put('/:sessionId/drill/:drillId', async (req: Request, res: Response): Promise<any> => {
  logger.info('HELLO PEOLE HELLOLE')
  logger.info('🧾 PUT /:sessionId/drill/:drillId called', {
  body: req.body,
});

  const sessionId = parseInt(req.params.sessionId);
  const drillId = parseInt(req.params.drillId);
  const {
    drillName,
    duration,
    restTime,
    numberOfSets,
    numberOfReps,
    drillCategory,
    materials,
    description,
    visualReference,
    createdByUser,
    basedOnName,
  } = req.body;

  if (isNaN(sessionId) || isNaN(drillId)) {
    return res.status(400).json({ error: 'Invalid session or drill ID' });
  }

  try {
    // Check drill belongs to session (optional but safer)
    const drill = await prisma.drill.findUnique({ where: { id: drillId } });
    if (!drill || drill.sessionId !== sessionId) {
      return res.status(404).json({ error: 'Drill not found in session' });
    }

    // Update drill with new variant data
    const updatedDrill = await prisma.drill.update({
      where: { id: drillId },
      data: {
        drillName,
        duration,
        restTime,
        numberOfSets,
        numberOfReps,
        drillCategory,
        materials,
        description,
        visualReference,
        createdByUser,
        basedOnName,
      },
    });

    res.status(200).json(updatedDrill);
  } catch (error) {
    logger.error('Error updating drill in session', { error });
    res.status(500).json({ error: 'Failed to update drill in session' });
  }
});


export default router;
