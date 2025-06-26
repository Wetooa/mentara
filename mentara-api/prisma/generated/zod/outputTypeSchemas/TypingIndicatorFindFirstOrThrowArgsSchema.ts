import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TypingIndicatorWhereInputSchema } from '../inputTypeSchemas/TypingIndicatorWhereInputSchema'
import { TypingIndicatorOrderByWithRelationInputSchema } from '../inputTypeSchemas/TypingIndicatorOrderByWithRelationInputSchema'
import { TypingIndicatorWhereUniqueInputSchema } from '../inputTypeSchemas/TypingIndicatorWhereUniqueInputSchema'
import { TypingIndicatorScalarFieldEnumSchema } from '../inputTypeSchemas/TypingIndicatorScalarFieldEnumSchema'
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const TypingIndicatorSelectSchema: z.ZodType<Prisma.TypingIndicatorSelect> = z.object({
  id: z.boolean().optional(),
  conversationId: z.boolean().optional(),
  userId: z.boolean().optional(),
  isTyping: z.boolean().optional(),
  lastTypingAt: z.boolean().optional(),
}).strict()

export const TypingIndicatorFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TypingIndicatorFindFirstOrThrowArgs> = z.object({
  select: TypingIndicatorSelectSchema.optional(),
  where: TypingIndicatorWhereInputSchema.optional(),
  orderBy: z.union([ TypingIndicatorOrderByWithRelationInputSchema.array(),TypingIndicatorOrderByWithRelationInputSchema ]).optional(),
  cursor: TypingIndicatorWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TypingIndicatorScalarFieldEnumSchema,TypingIndicatorScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default TypingIndicatorFindFirstOrThrowArgsSchema;
