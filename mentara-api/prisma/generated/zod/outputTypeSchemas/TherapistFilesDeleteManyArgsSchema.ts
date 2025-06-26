import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistFilesWhereInputSchema } from '../inputTypeSchemas/TherapistFilesWhereInputSchema'

export const TherapistFilesDeleteManyArgsSchema: z.ZodType<Prisma.TherapistFilesDeleteManyArgs> = z.object({
  where: TherapistFilesWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default TherapistFilesDeleteManyArgsSchema;
