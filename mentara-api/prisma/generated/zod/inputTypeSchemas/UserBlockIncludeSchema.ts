import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const UserBlockIncludeSchema: z.ZodType<Prisma.UserBlockInclude> = z.object({
  blocker: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  blocked: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default UserBlockIncludeSchema;
