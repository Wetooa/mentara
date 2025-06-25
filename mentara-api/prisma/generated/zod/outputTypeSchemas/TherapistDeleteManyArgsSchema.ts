import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistWhereInputSchema } from '../inputTypeSchemas/TherapistWhereInputSchema'

export const TherapistDeleteManyArgsSchema: z.ZodType<Prisma.TherapistDeleteManyArgs> = z.object({
  where: TherapistWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default TherapistDeleteManyArgsSchema;
