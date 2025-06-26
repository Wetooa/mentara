import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistCreateexpertiseInputSchema: z.ZodType<Prisma.TherapistCreateexpertiseInput> = z.object({
  set: z.string().array()
}).strict();

export default TherapistCreateexpertiseInputSchema;
