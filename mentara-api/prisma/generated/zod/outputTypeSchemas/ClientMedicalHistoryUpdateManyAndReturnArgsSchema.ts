import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientMedicalHistoryUpdateManyMutationInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryUpdateManyMutationInputSchema'
import { ClientMedicalHistoryUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryUncheckedUpdateManyInputSchema'
import { ClientMedicalHistoryWhereInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryWhereInputSchema'

export const ClientMedicalHistoryUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ClientMedicalHistoryUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ClientMedicalHistoryUpdateManyMutationInputSchema,ClientMedicalHistoryUncheckedUpdateManyInputSchema ]),
  where: ClientMedicalHistoryWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ClientMedicalHistoryUpdateManyAndReturnArgsSchema;
