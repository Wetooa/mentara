import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistCreateapproachesInputSchema: z.ZodType<Prisma.TherapistCreateapproachesInput> = z.object({
  set: z.string().array()
}).strict();

export default TherapistCreateapproachesInputSchema;
