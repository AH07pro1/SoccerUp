import { z } from 'zod';
import drillSchema from './drillSchema';

const drillObjectSchema = drillSchema

const sessionSchema = z.object({
  sessionName: z.string().min(1, 'Session name is required'),
  drills: z.array(drillObjectSchema).min(1, 'At least one drill is required'),
  objectives: z.array(z.string()).min(1, 'At least one objective is required'),
  materials: z.array(z.string()).optional(),
  scheduledDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export default sessionSchema;
