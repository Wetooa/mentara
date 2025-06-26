import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistFilesSelectSchema } from '../inputTypeSchemas/TherapistFilesSelectSchema';
import { TherapistFilesIncludeSchema } from '../inputTypeSchemas/TherapistFilesIncludeSchema';

export const TherapistFilesArgsSchema: z.ZodType<Prisma.TherapistFilesDefaultArgs> = z.object({
  select: z.lazy(() => TherapistFilesSelectSchema).optional(),
  include: z.lazy(() => TherapistFilesIncludeSchema).optional(),
}).strict();

export default TherapistFilesArgsSchema;
