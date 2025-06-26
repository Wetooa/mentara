import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistCreatelanguagesOfferedInputSchema: z.ZodType<Prisma.TherapistCreatelanguagesOfferedInput> = z.object({
  set: z.string().array()
}).strict();

export default TherapistCreatelanguagesOfferedInputSchema;
