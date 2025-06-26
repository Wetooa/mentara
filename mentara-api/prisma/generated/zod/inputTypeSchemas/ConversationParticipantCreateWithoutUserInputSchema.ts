import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ParticipantRoleSchema } from './ParticipantRoleSchema';
import { ConversationCreateNestedOneWithoutParticipantsInputSchema } from './ConversationCreateNestedOneWithoutParticipantsInputSchema';

export const ConversationParticipantCreateWithoutUserInputSchema: z.ZodType<Prisma.ConversationParticipantCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  joinedAt: z.coerce.date().optional(),
  lastReadAt: z.coerce.date().optional().nullable(),
  role: z.lazy(() => ParticipantRoleSchema).optional(),
  isActive: z.boolean().optional(),
  isMuted: z.boolean().optional(),
  conversation: z.lazy(() => ConversationCreateNestedOneWithoutParticipantsInputSchema)
}).strict();

export default ConversationParticipantCreateWithoutUserInputSchema;
