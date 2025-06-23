import { z } from 'zod';

const sessionSchema = z.object({
  sessionName: z.string().min(1, 'Session name is required'),
  drills: z.array(z.string()).min(1, 'At least one drill is required'),
  objectives: z.array(z.string()).min(1, 'At least one objective is required'),
  materials: z.array(z.string()).optional(),
});

export default sessionSchema;
