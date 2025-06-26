import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationTypeSchema } from './ConversationTypeSchema';
import { ConversationParticipantUncheckedCreateNestedManyWithoutConversationInputSchema } from './ConversationParticipantUncheckedCreateNestedManyWithoutConversationInputSchema';

export const ConversationUncheckedCreateWithoutMessagesInputSchema: z.ZodType<Prisma.ConversationUncheckedCreateWithoutMessagesInput> = z.object({
  id: z.string().uuid().optional(),
  type: z.lazy(() => ConversationTypeSchema).optional(),
  title: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  lastMessageAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  participants: z.lazy(() => ConversationParticipantUncheckedCreateNestedManyWithoutConversationInputSchema).optional()
}).strict();

export default ConversationUncheckedCreateWithoutMessagesInputSchema;
