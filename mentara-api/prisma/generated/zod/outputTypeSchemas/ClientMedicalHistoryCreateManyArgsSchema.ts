import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientMedicalHistoryCreateManyInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryCreateManyInputSchema'

export const ClientMedicalHistoryCreateManyArgsSchema: z.ZodType<Prisma.ClientMedicalHistoryCreateManyArgs> = z.object({
  data: z.union([ ClientMedicalHistoryCreateManyInputSchema,ClientMedicalHistoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ClientMedicalHistoryCreateManyArgsSchema;
