import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorCountOutputTypeSelectSchema } from './ModeratorCountOutputTypeSelectSchema';

export const ModeratorCountOutputTypeArgsSchema: z.ZodType<Prisma.ModeratorCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ModeratorCountOutputTypeSelectSchema).nullish(),
}).strict();

export default ModeratorCountOutputTypeSelectSchema;
