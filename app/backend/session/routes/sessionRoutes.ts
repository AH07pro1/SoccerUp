import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sessionSchema from '../sessionSchema';
import logger from '../../logger';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response): Promise<any> => {
  const result = sessionSchema.safeParse(req.body);

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
      create: validatedData.drills.map(drillName => ({
        drillName,
        duration: 10, 
        numberOfSets: 1, 
        numberOfReps: 1,
        drillCategory: 'fitness', 
        materials: [],
        description: `${drillName} description`,
      })),
    },
  },
});



    logger.info('Session created', { sessionId: session.id });  // <-- log success info

    res.status(201).json(session);
  } catch (error) {
    logger.error('Error creating session', { error });  // <-- log error with details
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
