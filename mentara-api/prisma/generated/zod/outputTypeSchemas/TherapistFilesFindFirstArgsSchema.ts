import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistFilesIncludeSchema } from '../inputTypeSchemas/TherapistFilesIncludeSchema'
import { TherapistFilesWhereInputSchema } from '../inputTypeSchemas/TherapistFilesWhereInputSchema'
import { TherapistFilesOrderByWithRelationInputSchema } from '../inputTypeSchemas/TherapistFilesOrderByWithRelationInputSchema'
import { TherapistFilesWhereUniqueInputSchema } from '../inputTypeSchemas/TherapistFilesWhereUniqueInputSchema'
import { TherapistFilesScalarFieldEnumSchema } from '../inputTypeSchemas/TherapistFilesScalarFieldEnumSchema'
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const TherapistFilesSelectSchema: z.ZodType<Prisma.TherapistFilesSelect> = z.object({
  id: z.boolean().optional(),
  therapistId: z.boolean().optional(),
  fileUrl: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  therapist: z.union([z.boolean(),z.lazy(() => TherapistArgsSchema)]).optional(),
}).strict()

export const TherapistFilesFindFirstArgsSchema: z.ZodType<Prisma.TherapistFilesFindFirstArgs> = z.object({
  select: TherapistFilesSelectSchema.optional(),
  include: z.lazy(() => TherapistFilesIncludeSchema).optional(),
  where: TherapistFilesWhereInputSchema.optional(),
  orderBy: z.union([ TherapistFilesOrderByWithRelationInputSchema.array(),TherapistFilesOrderByWithRelationInputSchema ]).optional(),
  cursor: TherapistFilesWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TherapistFilesScalarFieldEnumSchema,TherapistFilesScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default TherapistFilesFindFirstArgsSchema;
