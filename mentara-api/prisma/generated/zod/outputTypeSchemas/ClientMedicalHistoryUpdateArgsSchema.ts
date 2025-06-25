import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientMedicalHistoryIncludeSchema } from '../inputTypeSchemas/ClientMedicalHistoryIncludeSchema'
import { ClientMedicalHistoryUpdateInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryUpdateInputSchema'
import { ClientMedicalHistoryUncheckedUpdateInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryUncheckedUpdateInputSchema'
import { ClientMedicalHistoryWhereUniqueInputSchema } from '../inputTypeSchemas/ClientMedicalHistoryWhereUniqueInputSchema'
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

export const ClientMedicalHistoryUpdateArgsSchema: z.ZodType<Prisma.ClientMedicalHistoryUpdateArgs> = z.object({
  select: ClientMedicalHistorySelectSchema.optional(),
  include: z.lazy(() => ClientMedicalHistoryIncludeSchema).optional(),
  data: z.union([ ClientMedicalHistoryUpdateInputSchema,ClientMedicalHistoryUncheckedUpdateInputSchema ]),
  where: ClientMedicalHistoryWhereUniqueInputSchema,
}).strict() ;

export default ClientMedicalHistoryUpdateArgsSchema;
