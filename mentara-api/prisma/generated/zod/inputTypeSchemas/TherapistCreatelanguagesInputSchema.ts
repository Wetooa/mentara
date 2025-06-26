import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistCreatelanguagesInputSchema: z.ZodType<Prisma.TherapistCreatelanguagesInput> = z.object({
  set: z.string().array()
}).strict();

export default TherapistCreatelanguagesInputSchema;
