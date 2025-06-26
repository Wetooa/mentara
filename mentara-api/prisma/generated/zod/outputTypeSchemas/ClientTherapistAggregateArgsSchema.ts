import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientTherapistWhereInputSchema } from '../inputTypeSchemas/ClientTherapistWhereInputSchema'
import { ClientTherapistOrderByWithRelationInputSchema } from '../inputTypeSchemas/ClientTherapistOrderByWithRelationInputSchema'
import { ClientTherapistWhereUniqueInputSchema } from '../inputTypeSchemas/ClientTherapistWhereUniqueInputSchema'

export const ClientTherapistAggregateArgsSchema: z.ZodType<Prisma.ClientTherapistAggregateArgs> = z.object({
  where: ClientTherapistWhereInputSchema.optional(),
  orderBy: z.union([ ClientTherapistOrderByWithRelationInputSchema.array(),ClientTherapistOrderByWithRelationInputSchema ]).optional(),
  cursor: ClientTherapistWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ClientTherapistAggregateArgsSchema;
