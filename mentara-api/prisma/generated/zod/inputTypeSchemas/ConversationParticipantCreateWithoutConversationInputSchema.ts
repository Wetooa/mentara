import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ParticipantRoleSchema } from './ParticipantRoleSchema';
import { UserCreateNestedOneWithoutConversationsInputSchema } from './UserCreateNestedOneWithoutConversationsInputSchema';

export const ConversationParticipantCreateWithoutConversationInputSchema: z.ZodType<Prisma.ConversationParticipantCreateWithoutConversationInput> = z.object({
  id: z.string().uuid().optional(),
  joinedAt: z.coerce.date().optional(),
  lastReadAt: z.coerce.date().optional().nullable(),
  role: z.lazy(() => ParticipantRoleSchema).optional(),
  isActive: z.boolean().optional(),
  isMuted: z.boolean().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutConversationsInputSchema)
}).strict();

export default ConversationParticipantCreateWithoutConversationInputSchema;
