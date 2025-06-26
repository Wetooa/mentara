import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistFilesCreateManyInputSchema } from '../inputTypeSchemas/TherapistFilesCreateManyInputSchema'

export const TherapistFilesCreateManyArgsSchema: z.ZodType<Prisma.TherapistFilesCreateManyArgs> = z.object({
  data: z.union([ TherapistFilesCreateManyInputSchema,TherapistFilesCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default TherapistFilesCreateManyArgsSchema;
