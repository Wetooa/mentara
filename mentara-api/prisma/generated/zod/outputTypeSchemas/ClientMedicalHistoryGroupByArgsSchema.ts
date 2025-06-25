import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientMedicalHistoryWhereInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryWhereInputSchema'
import { ClientMedicalHistoryOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryOrderByWithAggregationInputSchema'
import { ClientMedicalHistoryScalarFieldEnumSchema } from '../inputTypeSchemas/ClientMedicalHistoryScalarFieldEnumSchema'
import { ClientMedicalHistoryScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryScalarWhereWithAggregatesInputSchema'

export const ClientMedicalHistoryGroupByArgsSchema: z.ZodType<Prisma.ClientMedicalHistoryGroupByArgs> = z.object({
  where: ClientMedicalHistoryWhereInputSchema.optional(),
  orderBy: z.union([ ClientMedicalHistoryOrderByWithAggregationInputSchema.array(),ClientMedicalHistoryOrderByWithAggregationInputSchema ]).optional(),
  by: ClientMedicalHistoryScalarFieldEnumSchema.array(),
  having: ClientMedicalHistoryScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ClientMedicalHistoryGroupByArgsSchema;
