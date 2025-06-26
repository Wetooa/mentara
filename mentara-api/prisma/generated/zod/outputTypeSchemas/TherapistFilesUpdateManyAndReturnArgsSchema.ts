import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistFilesUpdateManyMutationInputSchema } from '../inputTypeSchemas/TherapistFilesUpdateManyMutationInputSchema'
import { TherapistFilesUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/TherapistFilesUncheckedUpdateManyInputSchema'
import { TherapistFilesWhereInputSchema } from '../inputTypeSchemas/TherapistFilesWhereInputSchema'

export const TherapistFilesUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.TherapistFilesUpdateManyAndReturnArgs> = z.object({
  data: z.union([ TherapistFilesUpdateManyMutationInputSchema,TherapistFilesUncheckedUpdateManyInputSchema ]),
  where: TherapistFilesWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default TherapistFilesUpdateManyAndReturnArgsSchema;
