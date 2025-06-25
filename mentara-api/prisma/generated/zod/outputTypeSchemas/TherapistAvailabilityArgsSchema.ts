import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistAvailabilitySelectSchema } from '../inputTypeSchemas/TherapistAvailabilitySelectSchema';
import { TherapistAvailabilityIncludeSchema } from '../inputTypeSchemas/TherapistAvailabilityIncludeSchema';

export const TherapistAvailabilityArgsSchema: z.ZodType<Prisma.TherapistAvailabilityDefaultArgs> = z.object({
  select: z.lazy(() => TherapistAvailabilitySelectSchema).optional(),
  include: z.lazy(() => TherapistAvailabilityIncludeSchema).optional(),
}).strict();

export default TherapistAvailabilityArgsSchema;
