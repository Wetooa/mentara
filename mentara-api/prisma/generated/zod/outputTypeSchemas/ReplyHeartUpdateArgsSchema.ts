import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyHeartIncludeSchema } from '../inputTypeSchemas/ReplyHeartIncludeSchema'
import { ReplyHeartUpdateInputSchema } from '../inputTypeSchemas/ReplyHeartUpdateInputSchema'
import { ReplyHeartUncheckedUpdateInputSchema } from '../inputTypeSchemas/ReplyHeartUncheckedUpdateInputSchema'
import { ReplyHeartWhereUniqueInputSchema } from '../inputTypeSchemas/ReplyHeartWhereUniqueInputSchema'
import { ReplyArgsSchema } from "../outputTypeSchemas/ReplyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ReplyHeartSelectSchema: z.ZodType<Prisma.ReplyHeartSelect> = z.object({
  id: z.boolean().optional(),
  replyId: z.boolean().optional(),
  userId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  reply: z.union([z.boolean(),z.lazy(() => ReplyArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const ReplyHeartUpdateArgsSchema: z.ZodType<Prisma.ReplyHeartUpdateArgs> = z.object({
  select: ReplyHeartSelectSchema.optional(),
  include: z.lazy(() => ReplyHeartIncludeSchema).optional(),
  data: z.union([ ReplyHeartUpdateInputSchema,ReplyHeartUncheckedUpdateInputSchema ]),
  where: ReplyHeartWhereUniqueInputSchema,
}).strict() ;

export default ReplyHeartUpdateArgsSchema;
