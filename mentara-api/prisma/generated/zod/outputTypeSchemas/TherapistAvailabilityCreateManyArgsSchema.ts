import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistAvailabilityCreateManyInputSchema } from '../inputTypeSchemas/TherapistAvailabilityCreateManyInputSchema'

export const TherapistAvailabilityCreateManyArgsSchema: z.ZodType<Prisma.TherapistAvailabilityCreateManyArgs> = z.object({
  data: z.union([ TherapistAvailabilityCreateManyInputSchema,TherapistAvailabilityCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default TherapistAvailabilityCreateManyArgsSchema;
