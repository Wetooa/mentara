import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistCreateareasOfExpertiseInputSchema: z.ZodType<Prisma.TherapistCreateareasOfExpertiseInput> = z.object({
  set: z.string().array()
}).strict();

export default TherapistCreateareasOfExpertiseInputSchema;
