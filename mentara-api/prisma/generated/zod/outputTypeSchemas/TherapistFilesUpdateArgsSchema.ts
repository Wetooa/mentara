import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistFilesIncludeSchema } from '../inputTypeSchemas/TherapistFilesIncludeSchema'
import { TherapistFilesUpdateInputSchema } from '../inputTypeSchemas/TherapistFilesUpdateInputSchema'
import { TherapistFilesUncheckedUpdateInputSchema } from '../inputTypeSchemas/TherapistFilesUncheckedUpdateInputSchema'
import { TherapistFilesWhereUniqueInputSchema } from '../inputTypeSchemas/TherapistFilesWhereUniqueInputSchema'
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

export const TherapistFilesUpdateArgsSchema: z.ZodType<Prisma.TherapistFilesUpdateArgs> = z.object({
  select: TherapistFilesSelectSchema.optional(),
  include: z.lazy(() => TherapistFilesIncludeSchema).optional(),
  data: z.union([ TherapistFilesUpdateInputSchema,TherapistFilesUncheckedUpdateInputSchema ]),
  where: TherapistFilesWhereUniqueInputSchema,
}).strict() ;

export default TherapistFilesUpdateArgsSchema;
