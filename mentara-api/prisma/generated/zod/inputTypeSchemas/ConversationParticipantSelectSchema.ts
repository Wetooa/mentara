import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationArgsSchema } from "../outputTypeSchemas/ConversationArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const ConversationParticipantSelectSchema: z.ZodType<Prisma.ConversationParticipantSelect> = z.object({
  id: z.boolean().optional(),
  conversationId: z.boolean().optional(),
  userId: z.boolean().optional(),
  joinedAt: z.boolean().optional(),
  lastReadAt: z.boolean().optional(),
  role: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isMuted: z.boolean().optional(),
  conversation: z.union([z.boolean(),z.lazy(() => ConversationArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default ConversationParticipantSelectSchema;
