import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientPreferenceIncludeSchema } from '../inputTypeSchemas/ClientPreferenceIncludeSchema'
import { ClientPreferenceWhereInputSchema } from '../inputTypeSchemas/ClientPreferenceWhereInputSchema'
import { ClientPreferenceOrderByWithRelationInputSchema } from '../inputTypeSchemas/ClientPreferenceOrderByWithRelationInputSchema'
import { ClientPreferenceWhereUniqueInputSchema } from '../inputTypeSchemas/ClientPreferenceWhereUniqueInputSchema'
import { ClientPreferenceScalarFieldEnumSchema } from '../inputTypeSchemas/ClientPreferenceScalarFieldEnumSchema'
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ClientPreferenceSelectSchema: z.ZodType<Prisma.ClientPreferenceSelect> = z.object({
  id: z.boolean().optional(),
  clientId: z.boolean().optional(),
  key: z.boolean().optional(),
  value: z.boolean().optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
}).strict()

export const ClientPreferenceFindManyArgsSchema: z.ZodType<Prisma.ClientPreferenceFindManyArgs> = z.object({
  select: ClientPreferenceSelectSchema.optional(),
  include: z.lazy(() => ClientPreferenceIncludeSchema).optional(),
  where: ClientPreferenceWhereInputSchema.optional(),
  orderBy: z.union([ ClientPreferenceOrderByWithRelationInputSchema.array(),ClientPreferenceOrderByWithRelationInputSchema ]).optional(),
  cursor: ClientPreferenceWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ClientPreferenceScalarFieldEnumSchema,ClientPreferenceScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default ClientPreferenceFindManyArgsSchema;
