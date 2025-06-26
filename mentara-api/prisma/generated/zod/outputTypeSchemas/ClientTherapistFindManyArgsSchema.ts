import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientTherapistIncludeSchema } from '../inputTypeSchemas/ClientTherapistIncludeSchema'
import { ClientTherapistWhereInputSchema } from '../inputTypeSchemas/ClientTherapistWhereInputSchema'
import { ClientTherapistOrderByWithRelationInputSchema } from '../inputTypeSchemas/ClientTherapistOrderByWithRelationInputSchema'
import { ClientTherapistWhereUniqueInputSchema } from '../inputTypeSchemas/ClientTherapistWhereUniqueInputSchema'
import { ClientTherapistScalarFieldEnumSchema } from '../inputTypeSchemas/ClientTherapistScalarFieldEnumSchema'
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ClientTherapistSelectSchema: z.ZodType<Prisma.ClientTherapistSelect> = z.object({
  id: z.boolean().optional(),
  clientId: z.boolean().optional(),
  therapistId: z.boolean().optional(),
  assignedAt: z.boolean().optional(),
  status: z.boolean().optional(),
  notes: z.boolean().optional(),
  score: z.boolean().optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
  therapist: z.union([z.boolean(),z.lazy(() => TherapistArgsSchema)]).optional(),
}).strict()

export const ClientTherapistFindManyArgsSchema: z.ZodType<Prisma.ClientTherapistFindManyArgs> = z.object({
  select: ClientTherapistSelectSchema.optional(),
  include: z.lazy(() => ClientTherapistIncludeSchema).optional(),
  where: ClientTherapistWhereInputSchema.optional(),
  orderBy: z.union([ ClientTherapistOrderByWithRelationInputSchema.array(),ClientTherapistOrderByWithRelationInputSchema ]).optional(),
  cursor: ClientTherapistWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ClientTherapistScalarFieldEnumSchema,ClientTherapistScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default ClientTherapistFindManyArgsSchema;
