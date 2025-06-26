import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistAvailabilityUpdateManyMutationInputSchema } from '../inputTypeSchemas/TherapistAvailabilityUpdateManyMutationInputSchema'
import { TherapistAvailabilityUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/TherapistAvailabilityUncheckedUpdateManyInputSchema'
import { TherapistAvailabilityWhereInputSchema } from '../inputTypeSchemas/TherapistAvailabilityWhereInputSchema'

export const TherapistAvailabilityUpdateManyArgsSchema: z.ZodType<Prisma.TherapistAvailabilityUpdateManyArgs> = z.object({
  data: z.union([ TherapistAvailabilityUpdateManyMutationInputSchema,TherapistAvailabilityUncheckedUpdateManyInputSchema ]),
  where: TherapistAvailabilityWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default TherapistAvailabilityUpdateManyArgsSchema;
