import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserBlockIncludeSchema } from '../inputTypeSchemas/UserBlockIncludeSchema'
import { UserBlockWhereUniqueInputSchema } from '../inputTypeSchemas/UserBlockWhereUniqueInputSchema'
import { UserBlockCreateInputSchema } from '../inputTypeSchemas/UserBlockCreateInputSchema'
import { UserBlockUncheckedCreateInputSchema } from '../inputTypeSchemas/UserBlockUncheckedCreateInputSchema'
import { UserBlockUpdateInputSchema } from '../inputTypeSchemas/UserBlockUpdateInputSchema'
import { UserBlockUncheckedUpdateInputSchema } from '../inputTypeSchemas/UserBlockUncheckedUpdateInputSchema'
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

export const UserBlockUpsertArgsSchema: z.ZodType<Prisma.UserBlockUpsertArgs> = z.object({
  select: UserBlockSelectSchema.optional(),
  include: z.lazy(() => UserBlockIncludeSchema).optional(),
  where: UserBlockWhereUniqueInputSchema,
  create: z.union([ UserBlockCreateInputSchema,UserBlockUncheckedCreateInputSchema ]),
  update: z.union([ UserBlockUpdateInputSchema,UserBlockUncheckedUpdateInputSchema ]),
}).strict() ;

export default UserBlockUpsertArgsSchema;
