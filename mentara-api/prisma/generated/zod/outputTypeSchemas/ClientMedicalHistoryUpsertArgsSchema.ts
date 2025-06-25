import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientMedicalHistoryIncludeSchema } from '../inputTypeSchemas/ClientMedicalHistoryIncludeSchema'
import { ClientMedicalHistoryWhereUniqueInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryWhereUniqueInputSchema'
import { ClientMedicalHistoryCreateInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryCreateInputSchema'
import { ClientMedicalHistoryUncheckedCreateInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryUncheckedCreateInputSchema'
import { ClientMedicalHistoryUpdateInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryUpdateInputSchema'
import { ClientMedicalHistoryUncheckedUpdateInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryUncheckedUpdateInputSchema'
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

export const ClientMedicalHistoryUpsertArgsSchema: z.ZodType<Prisma.ClientMedicalHistoryUpsertArgs> = z.object({
  select: ClientMedicalHistorySelectSchema.optional(),
  include: z.lazy(() => ClientMedicalHistoryIncludeSchema).optional(),
  where: ClientMedicalHistoryWhereUniqueInputSchema,
  create: z.union([ ClientMedicalHistoryCreateInputSchema,ClientMedicalHistoryUncheckedCreateInputSchema ]),
  update: z.union([ ClientMedicalHistoryUpdateInputSchema,ClientMedicalHistoryUncheckedUpdateInputSchema ]),
}).strict() ;

export default ClientMedicalHistoryUpsertArgsSchema;
