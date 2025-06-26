import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserBlockIncludeSchema } from '../inputTypeSchemas/UserBlockIncludeSchema'
import { UserBlockWhereUniqueInputSchema } from '../inputTypeSchemas/UserBlockWhereUniqueInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const UserBlockSelectSchema: z.ZodType<Prisma.UserBlockSelect> = z.object({
  id: z.boolean().optional(),
  blockerId: z.boolean().optional(),
  blockedId: z.boolean().optional(),
  reason: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  blocker: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  blocked: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserBlockFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserBlockFindUniqueOrThrowArgs> = z.object({
  select: UserBlockSelectSchema.optional(),
  include: z.lazy(() => UserBlockIncludeSchema).optional(),
  where: UserBlockWhereUniqueInputSchema,
}).strict() ;

export default UserBlockFindUniqueOrThrowArgsSchema;
