import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientPreferenceIncludeSchema } from '../inputTypeSchemas/ClientPreferenceIncludeSchema'
import { ClientPreferenceUpdateInputSchema } from '../inputTypeSchemas/ClientPreferenceUpdateInputSchema'
import { ClientPreferenceUncheckedUpdateInputSchema } from '../inputTypeSchemas/ClientPreferenceUncheckedUpdateInputSchema'
import { ClientPreferenceWhereUniqueInputSchema } from '../inputTypeSchemas/ClientPreferenceWhereUniqueInputSchema'
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

export const ClientPreferenceUpdateArgsSchema: z.ZodType<Prisma.ClientPreferenceUpdateArgs> = z.object({
  select: ClientPreferenceSelectSchema.optional(),
  include: z.lazy(() => ClientPreferenceIncludeSchema).optional(),
  data: z.union([ ClientPreferenceUpdateInputSchema,ClientPreferenceUncheckedUpdateInputSchema ]),
  where: ClientPreferenceWhereUniqueInputSchema,
}).strict() ;

export default ClientPreferenceUpdateArgsSchema;
