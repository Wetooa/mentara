import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyFileIncludeSchema } from '../inputTypeSchemas/ReplyFileIncludeSchema'
import { ReplyFileWhereInputSchema } from '../inputTypeSchemas/ReplyFileWhereInputSchema'
import { ReplyFileOrderByWithRelationInputSchema } from '../inputTypeSchemas/ReplyFileOrderByWithRelationInputSchema'
import { ReplyFileWhereUniqueInputSchema } from '../inputTypeSchemas/ReplyFileWhereUniqueInputSchema'
import { ReplyFileScalarFieldEnumSchema } from '../inputTypeSchemas/ReplyFileScalarFieldEnumSchema'
import { ReplyArgsSchema } from "../outputTypeSchemas/ReplyArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ReplyFileSelectSchema: z.ZodType<Prisma.ReplyFileSelect> = z.object({
  id: z.boolean().optional(),
  replyId: z.boolean().optional(),
  url: z.boolean().optional(),
  type: z.boolean().optional(),
  reply: z.union([z.boolean(),z.lazy(() => ReplyArgsSchema)]).optional(),
}).strict()

export const ReplyFileFindFirstArgsSchema: z.ZodType<Prisma.ReplyFileFindFirstArgs> = z.object({
  select: ReplyFileSelectSchema.optional(),
  include: z.lazy(() => ReplyFileIncludeSchema).optional(),
  where: ReplyFileWhereInputSchema.optional(),
  orderBy: z.union([ ReplyFileOrderByWithRelationInputSchema.array(),ReplyFileOrderByWithRelationInputSchema ]).optional(),
  cursor: ReplyFileWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReplyFileScalarFieldEnumSchema,ReplyFileScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default ReplyFileFindFirstArgsSchema;
