import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientPreferenceIncludeSchema } from '../inputTypeSchemas/ClientPreferenceIncludeSchema'
import { ClientPreferenceWhereUniqueInputSchema } from '../inputTypeSchemas/ClientPreferenceWhereUniqueInputSchema'
import { ClientPreferenceCreateInputSchema } from '../inputTypeSchemas/ClientPreferenceCreateInputSchema'
import { ClientPreferenceUncheckedCreateInputSchema } from '../inputTypeSchemas/ClientPreferenceUncheckedCreateInputSchema'
import { ClientPreferenceUpdateInputSchema } from '../inputTypeSchemas/ClientPreferenceUpdateInputSchema'
import { ClientPreferenceUncheckedUpdateInputSchema } from '../inputTypeSchemas/ClientPreferenceUncheckedUpdateInputSchema'
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

export const ClientPreferenceUpsertArgsSchema: z.ZodType<Prisma.ClientPreferenceUpsertArgs> = z.object({
  select: ClientPreferenceSelectSchema.optional(),
  include: z.lazy(() => ClientPreferenceIncludeSchema).optional(),
  where: ClientPreferenceWhereUniqueInputSchema,
  create: z.union([ ClientPreferenceCreateInputSchema,ClientPreferenceUncheckedCreateInputSchema ]),
  update: z.union([ ClientPreferenceUpdateInputSchema,ClientPreferenceUncheckedUpdateInputSchema ]),
}).strict() ;

export default ClientPreferenceUpsertArgsSchema;
