import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistUpdateManyMutationInputSchema } from '../inputTypeSchemas/TherapistUpdateManyMutationInputSchema'
import { TherapistUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/TherapistUncheckedUpdateManyInputSchema'
import { TherapistWhereInputSchema } from '../inputTypeSchemas/TherapistWhereInputSchema'

export const TherapistUpdateManyArgsSchema: z.ZodType<Prisma.TherapistUpdateManyArgs> = z.object({
  data: z.union([ TherapistUpdateManyMutationInputSchema,TherapistUncheckedUpdateManyInputSchema ]),
  where: TherapistWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default TherapistUpdateManyArgsSchema;
