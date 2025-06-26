import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistCreateacceptTypesInputSchema: z.ZodType<Prisma.TherapistCreateacceptTypesInput> = z.object({
  set: z.string().array()
}).strict();

export default TherapistCreateacceptTypesInputSchema;
