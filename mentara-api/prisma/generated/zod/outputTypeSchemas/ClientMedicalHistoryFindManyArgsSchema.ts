import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientMedicalHistoryIncludeSchema } from '../inputTypeSchemas/ClientMedicalHistoryIncludeSchema'
import { ClientMedicalHistoryWhereInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryWhereInputSchema'
import { ClientMedicalHistoryOrderByWithRelationInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryOrderByWithRelationInputSchema'
import { ClientMedicalHistoryWhereUniqueInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryWhereUniqueInputSchema'
import { ClientMedicalHistoryScalarFieldEnumSchema } from '../inputTypeSchemas/ClientMedicalHistoryScalarFieldEnumSchema'
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ClientMedicalHistorySelectSchema: z.ZodType<Prisma.ClientMedicalHistorySelect> = z.object({
  id: z.boolean().optional(),
  clientId: z.boolean().optional(),
  condition: z.boolean().optional(),
  notes: z.boolean().optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
}).strict()

export const ClientMedicalHistoryFindManyArgsSchema: z.ZodType<Prisma.ClientMedicalHistoryFindManyArgs> = z.object({
  select: ClientMedicalHistorySelectSchema.optional(),
  include: z.lazy(() => ClientMedicalHistoryIncludeSchema).optional(),
  where: ClientMedicalHistoryWhereInputSchema.optional(),
  orderBy: z.union([ ClientMedicalHistoryOrderByWithRelationInputSchema.array(),ClientMedicalHistoryOrderByWithRelationInputSchema ]).optional(),
  cursor: ClientMedicalHistoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ClientMedicalHistoryScalarFieldEnumSchema,ClientMedicalHistoryScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default ClientMedicalHistoryFindManyArgsSchema;
