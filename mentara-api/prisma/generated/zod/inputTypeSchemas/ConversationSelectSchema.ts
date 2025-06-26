import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationParticipantFindManyArgsSchema } from "../outputTypeSchemas/ConversationParticipantFindManyArgsSchema"
import { MessageFindManyArgsSchema } from "../outputTypeSchemas/MessageFindManyArgsSchema"
import { ConversationCountOutputTypeArgsSchema } from "../outputTypeSchemas/ConversationCountOutputTypeArgsSchema"

export const ConversationSelectSchema: z.ZodType<Prisma.ConversationSelect> = z.object({
  id: z.boolean().optional(),
  type: z.boolean().optional(),
  title: z.boolean().optional(),
  isActive: z.boolean().optional(),
  lastMessageAt: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  participants: z.union([z.boolean(),z.lazy(() => ConversationParticipantFindManyArgsSchema)]).optional(),
  messages: z.union([z.boolean(),z.lazy(() => MessageFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ConversationCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default ConversationSelectSchema;
