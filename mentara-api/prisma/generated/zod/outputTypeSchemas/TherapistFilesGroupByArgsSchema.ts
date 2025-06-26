import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistFilesWhereInputSchema } from '../inputTypeSchemas/TherapistFilesWhereInputSchema'
import { TherapistFilesOrderByWithAggregationInputSchema } from '../inputTypeSchemas/TherapistFilesOrderByWithAggregationInputSchema'
import { TherapistFilesScalarFieldEnumSchema } from '../inputTypeSchemas/TherapistFilesScalarFieldEnumSchema'
import { TherapistFilesScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/TherapistFilesScalarWhereWithAggregatesInputSchema'

export const TherapistFilesGroupByArgsSchema: z.ZodType<Prisma.TherapistFilesGroupByArgs> = z.object({
  where: TherapistFilesWhereInputSchema.optional(),
  orderBy: z.union([ TherapistFilesOrderByWithAggregationInputSchema.array(),TherapistFilesOrderByWithAggregationInputSchema ]).optional(),
  by: TherapistFilesScalarFieldEnumSchema.array(),
  having: TherapistFilesScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default TherapistFilesGroupByArgsSchema;
