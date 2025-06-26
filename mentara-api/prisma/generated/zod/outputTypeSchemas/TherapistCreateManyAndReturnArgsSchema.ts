import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistCreateManyInputSchema } from '../inputTypeSchemas/TherapistCreateManyInputSchema'

export const TherapistCreateManyAndReturnArgsSchema: z.ZodType<Prisma.TherapistCreateManyAndReturnArgs> = z.object({
  data: z.union([ TherapistCreateManyInputSchema,TherapistCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default TherapistCreateManyAndReturnArgsSchema;
