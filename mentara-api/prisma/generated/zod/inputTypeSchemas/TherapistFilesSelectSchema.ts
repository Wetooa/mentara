import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"

export const TherapistFilesSelectSchema: z.ZodType<Prisma.TherapistFilesSelect> = z.object({
  id: z.boolean().optional(),
  therapistId: z.boolean().optional(),
  fileUrl: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  therapist: z.union([z.boolean(),z.lazy(() => TherapistArgsSchema)]).optional(),
}).strict()

export default TherapistFilesSelectSchema;
