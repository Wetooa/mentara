import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const ModeratorCountOutputTypeSelectSchema: z.ZodType<Prisma.ModeratorCountOutputTypeSelect> = z.object({
  moderatorCommunities: z.boolean().optional(),
}).strict();

export default ModeratorCountOutputTypeSelectSchema;
