import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientMedicalHistoryWhereInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryWhereInputSchema'

export const ClientMedicalHistoryDeleteManyArgsSchema: z.ZodType<Prisma.ClientMedicalHistoryDeleteManyArgs> = z.object({
  where: ClientMedicalHistoryWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ClientMedicalHistoryDeleteManyArgsSchema;
