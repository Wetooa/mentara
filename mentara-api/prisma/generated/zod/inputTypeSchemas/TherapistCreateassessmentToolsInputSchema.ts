import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistCreateassessmentToolsInputSchema: z.ZodType<Prisma.TherapistCreateassessmentToolsInput> = z.object({
  set: z.string().array()
}).strict();

export default TherapistCreateassessmentToolsInputSchema;
