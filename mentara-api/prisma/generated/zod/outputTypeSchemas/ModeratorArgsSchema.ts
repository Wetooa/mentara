import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorSelectSchema } from '../inputTypeSchemas/ModeratorSelectSchema';
import { ModeratorIncludeSchema } from '../inputTypeSchemas/ModeratorIncludeSchema';

export const ModeratorArgsSchema: z.ZodType<Prisma.ModeratorDefaultArgs> = z.object({
  select: z.lazy(() => ModeratorSelectSchema).optional(),
  include: z.lazy(() => ModeratorIncludeSchema).optional(),
}).strict();

export default ModeratorArgsSchema;
