import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationTypeSchema } from './ConversationTypeSchema';
import { ConversationParticipantCreateNestedManyWithoutConversationInputSchema } from './ConversationParticipantCreateNestedManyWithoutConversationInputSchema';

export const ConversationCreateWithoutMessagesInputSchema: z.ZodType<Prisma.ConversationCreateWithoutMessagesInput> = z.object({
  id: z.string().uuid().optional(),
  type: z.lazy(() => ConversationTypeSchema).optional(),
  title: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  lastMessageAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  participants: z.lazy(() => ConversationParticipantCreateNestedManyWithoutConversationInputSchema).optional()
}).strict();

export default ConversationCreateWithoutMessagesInputSchema;
