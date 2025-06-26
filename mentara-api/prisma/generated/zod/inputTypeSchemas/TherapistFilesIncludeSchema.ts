import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"

export const TherapistFilesIncludeSchema: z.ZodType<Prisma.TherapistFilesInclude> = z.object({
  therapist: z.union([z.boolean(),z.lazy(() => TherapistArgsSchema)]).optional(),
}).strict()

export default TherapistFilesIncludeSchema;
