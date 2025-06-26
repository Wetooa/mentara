import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyFileIncludeSchema } from '../inputTypeSchemas/ReplyFileIncludeSchema'
import { ReplyFileCreateInputSchema } from '../inputTypeSchemas/ReplyFileCreateInputSchema'
import { ReplyFileUncheckedCreateInputSchema } from '../inputTypeSchemas/ReplyFileUncheckedCreateInputSchema'
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

export const ReplyFileCreateArgsSchema: z.ZodType<Prisma.ReplyFileCreateArgs> = z.object({
  select: ReplyFileSelectSchema.optional(),
  include: z.lazy(() => ReplyFileIncludeSchema).optional(),
  data: z.union([ ReplyFileCreateInputSchema,ReplyFileUncheckedCreateInputSchema ]),
}).strict() ;

export default ReplyFileCreateArgsSchema;
