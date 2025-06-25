import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistAvailabilityWhereInputSchema } from '../inputTypeSchemas/TherapistAvailabilityWhereInputSchema'

export const TherapistAvailabilityDeleteManyArgsSchema: z.ZodType<Prisma.TherapistAvailabilityDeleteManyArgs> = z.object({
  where: TherapistAvailabilityWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default TherapistAvailabilityDeleteManyArgsSchema;
