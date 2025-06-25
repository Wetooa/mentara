import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyHeartIncludeSchema } from '../inputTypeSchemas/ReplyHeartIncludeSchema'
import { ReplyHeartWhereUniqueInputSchema } from '../inputTypeSchemas/ReplyHeartWhereUniqueInputSchema'
import { ReplyHeartCreateInputSchema } from '../inputTypeSchemas/ReplyHeartCreateInputSchema'
import { ReplyHeartUncheckedCreateInputSchema } from '../inputTypeSchemas/ReplyHeartUncheckedCreateInputSchema'
import { ReplyHeartUpdateInputSchema } from '../inputTypeSchemas/ReplyHeartUpdateInputSchema'
import { ReplyHeartUncheckedUpdateInputSchema } from '../inputTypeSchemas/ReplyHeartUncheckedUpdateInputSchema'
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

export const ReplyHeartUpsertArgsSchema: z.ZodType<Prisma.ReplyHeartUpsertArgs> = z.object({
  select: ReplyHeartSelectSchema.optional(),
  include: z.lazy(() => ReplyHeartIncludeSchema).optional(),
  where: ReplyHeartWhereUniqueInputSchema,
  create: z.union([ ReplyHeartCreateInputSchema,ReplyHeartUncheckedCreateInputSchema ]),
  update: z.union([ ReplyHeartUpdateInputSchema,ReplyHeartUncheckedUpdateInputSchema ]),
}).strict() ;

export default ReplyHeartUpsertArgsSchema;
