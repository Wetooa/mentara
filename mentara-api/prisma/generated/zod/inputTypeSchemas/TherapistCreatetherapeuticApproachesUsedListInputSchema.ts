import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistCreatetherapeuticApproachesUsedListInputSchema: z.ZodType<Prisma.TherapistCreatetherapeuticApproachesUsedListInput> = z.object({
  set: z.string().array()
}).strict();

export default TherapistCreatetherapeuticApproachesUsedListInputSchema;
