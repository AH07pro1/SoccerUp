import { z } from 'zod';

// Match the enum from your Prisma schema
export const drillCategoryEnum = z.enum([
  'passing',
  'shooting',
  'dribbling',
  'defending',
  'goalkeeping',
  'fitness',
  'tactics' // Added 'tactics' as per your schema
]);

const drillSchema = z.object({
  drillName: z.string().min(1, "Drill name is required"),
  duration: z.number()
    .int("Duration must be an integer")
    .positive("Duration must be greater than 0"),
  numberOfSets: z.number()
    .int("Number of sets must be an integer")
    .min(1, "Number of sets must be at least 1"),
  numberOfReps: z.number()
    .int("Number of reps must be an integer")
    .min(1, "Number of reps must be at least 1"),
  drillCategory: z.enum([
    'passing', 'shooting', 'dribbling', 'defending', 'goalkeeping', 'fitness'
  ]),
  materials: z.array(z.string()).optional(),
  description: z.string().min(1, "Description is required"),
  visualReference: z.string().url().optional().nullable(),
  createdByUser: z.boolean().default(false),
  restTime: z.number()
  .int("Rest time must be an integer")
  .nonnegative("Rest time can't be negative"),
  basedOnName: z.string().optional() // Optional field for variants

});
export default drillSchema;