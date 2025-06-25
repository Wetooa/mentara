import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ModeratorCreatepermissionsInputSchema: z.ZodType<Prisma.ModeratorCreatepermissionsInput> = z.object({
  set: z.string().array()
}).strict();

export default ModeratorCreatepermissionsInputSchema;
