import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyHeartIncludeSchema } from '../inputTypeSchemas/ReplyHeartIncludeSchema'
import { ReplyHeartCreateInputSchema } from '../inputTypeSchemas/ReplyHeartCreateInputSchema'
import { ReplyHeartUncheckedCreateInputSchema } from '../inputTypeSchemas/ReplyHeartUncheckedCreateInputSchema'
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

export const ReplyHeartCreateArgsSchema: z.ZodType<Prisma.ReplyHeartCreateArgs> = z.object({
  select: ReplyHeartSelectSchema.optional(),
  include: z.lazy(() => ReplyHeartIncludeSchema).optional(),
  data: z.union([ ReplyHeartCreateInputSchema,ReplyHeartUncheckedCreateInputSchema ]),
}).strict() ;

export default ReplyHeartCreateArgsSchema;
