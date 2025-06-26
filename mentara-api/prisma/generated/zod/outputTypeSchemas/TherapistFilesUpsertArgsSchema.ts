import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistFilesIncludeSchema } from '../inputTypeSchemas/TherapistFilesIncludeSchema'
import { TherapistFilesWhereUniqueInputSchema } from '../inputTypeSchemas/TherapistFilesWhereUniqueInputSchema'
import { TherapistFilesCreateInputSchema } from '../inputTypeSchemas/TherapistFilesCreateInputSchema'
import { TherapistFilesUncheckedCreateInputSchema } from '../inputTypeSchemas/TherapistFilesUncheckedCreateInputSchema'
import { TherapistFilesUpdateInputSchema } from '../inputTypeSchemas/TherapistFilesUpdateInputSchema'
import { TherapistFilesUncheckedUpdateInputSchema } from '../inputTypeSchemas/TherapistFilesUncheckedUpdateInputSchema'
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

export const TherapistFilesUpsertArgsSchema: z.ZodType<Prisma.TherapistFilesUpsertArgs> = z.object({
  select: TherapistFilesSelectSchema.optional(),
  include: z.lazy(() => TherapistFilesIncludeSchema).optional(),
  where: TherapistFilesWhereUniqueInputSchema,
  create: z.union([ TherapistFilesCreateInputSchema,TherapistFilesUncheckedCreateInputSchema ]),
  update: z.union([ TherapistFilesUpdateInputSchema,TherapistFilesUncheckedUpdateInputSchema ]),
}).strict() ;

export default TherapistFilesUpsertArgsSchema;
