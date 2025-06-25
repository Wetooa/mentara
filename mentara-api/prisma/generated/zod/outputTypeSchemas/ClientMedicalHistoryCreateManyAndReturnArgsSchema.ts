import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientMedicalHistoryCreateManyInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryCreateManyInputSchema'

export const ClientMedicalHistoryCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ClientMedicalHistoryCreateManyAndReturnArgs> = z.object({
  data: z.union([ ClientMedicalHistoryCreateManyInputSchema,ClientMedicalHistoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ClientMedicalHistoryCreateManyAndReturnArgsSchema;
