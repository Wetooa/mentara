import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserBlockSelectSchema } from '../inputTypeSchemas/UserBlockSelectSchema';
import { UserBlockIncludeSchema } from '../inputTypeSchemas/UserBlockIncludeSchema';

export const UserBlockArgsSchema: z.ZodType<Prisma.UserBlockDefaultArgs> = z.object({
  select: z.lazy(() => UserBlockSelectSchema).optional(),
  include: z.lazy(() => UserBlockIncludeSchema).optional(),
}).strict();

export default UserBlockArgsSchema;
