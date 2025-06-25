import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyHeartIncludeSchema } from '../inputTypeSchemas/ReplyHeartIncludeSchema'
import { ReplyHeartWhereInputSchema } from '../inputTypeSchemas/ReplyHeartWhereInputSchema'
import { ReplyHeartOrderByWithRelationInputSchema } from '../inputTypeSchemas/ReplyHeartOrderByWithRelationInputSchema'
import { ReplyHeartWhereUniqueInputSchema } from '../inputTypeSchemas/ReplyHeartWhereUniqueInputSchema'
import { ReplyHeartScalarFieldEnumSchema } from '../inputTypeSchemas/ReplyHeartScalarFieldEnumSchema'
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

export const ReplyHeartFindManyArgsSchema: z.ZodType<Prisma.ReplyHeartFindManyArgs> = z.object({
  select: ReplyHeartSelectSchema.optional(),
  include: z.lazy(() => ReplyHeartIncludeSchema).optional(),
  where: ReplyHeartWhereInputSchema.optional(),
  orderBy: z.union([ ReplyHeartOrderByWithRelationInputSchema.array(),ReplyHeartOrderByWithRelationInputSchema ]).optional(),
  cursor: ReplyHeartWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReplyHeartScalarFieldEnumSchema,ReplyHeartScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default ReplyHeartFindManyArgsSchema;
