import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistSelectSchema } from '../inputTypeSchemas/TherapistSelectSchema';
import { TherapistIncludeSchema } from '../inputTypeSchemas/TherapistIncludeSchema';

export const TherapistArgsSchema: z.ZodType<Prisma.TherapistDefaultArgs> = z.object({
  select: z.lazy(() => TherapistSelectSchema).optional(),
  include: z.lazy(() => TherapistIncludeSchema).optional(),
}).strict();

export default TherapistArgsSchema;
