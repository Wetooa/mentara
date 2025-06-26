import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistFilesWhereInputSchema } from '../inputTypeSchemas/TherapistFilesWhereInputSchema'
import { TherapistFilesOrderByWithRelationInputSchema } from '../inputTypeSchemas/TherapistFilesOrderByWithRelationInputSchema'
import { TherapistFilesWhereUniqueInputSchema } from '../inputTypeSchemas/TherapistFilesWhereUniqueInputSchema'

export const TherapistFilesAggregateArgsSchema: z.ZodType<Prisma.TherapistFilesAggregateArgs> = z.object({
  where: TherapistFilesWhereInputSchema.optional(),
  orderBy: z.union([ TherapistFilesOrderByWithRelationInputSchema.array(),TherapistFilesOrderByWithRelationInputSchema ]).optional(),
  cursor: TherapistFilesWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default TherapistFilesAggregateArgsSchema;
