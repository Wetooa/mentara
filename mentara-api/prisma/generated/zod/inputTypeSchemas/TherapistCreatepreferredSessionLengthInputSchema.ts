import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TherapistCreatepreferredSessionLengthInputSchema: z.ZodType<Prisma.TherapistCreatepreferredSessionLengthInput> = z.object({
  set: z.number().array()
}).strict();

export default TherapistCreatepreferredSessionLengthInputSchema;
