import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientMedicalHistoryWhereInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryWhereInputSchema'
import { ClientMedicalHistoryOrderByWithRelationInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryOrderByWithRelationInputSchema'
import { ClientMedicalHistoryWhereUniqueInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryWhereUniqueInputSchema'

export const ClientMedicalHistoryAggregateArgsSchema: z.ZodType<Prisma.ClientMedicalHistoryAggregateArgs> = z.object({
  where: ClientMedicalHistoryWhereInputSchema.optional(),
  orderBy: z.union([ ClientMedicalHistoryOrderByWithRelationInputSchema.array(),ClientMedicalHistoryOrderByWithRelationInputSchema ]).optional(),
  cursor: ClientMedicalHistoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ClientMedicalHistoryAggregateArgsSchema;
