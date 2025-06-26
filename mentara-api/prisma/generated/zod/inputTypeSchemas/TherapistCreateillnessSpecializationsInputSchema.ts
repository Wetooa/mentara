import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistCreateillnessSpecializationsInputSchema: z.ZodType<Prisma.TherapistCreateillnessSpecializationsInput> = z.object({
  set: z.string().array()
}).strict();

export default TherapistCreateillnessSpecializationsInputSchema;
