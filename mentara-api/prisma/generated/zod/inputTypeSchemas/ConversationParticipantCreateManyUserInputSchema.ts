import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ParticipantRoleSchema } from './ParticipantRoleSchema';

export const ConversationParticipantCreateManyUserInputSchema: z.ZodType<Prisma.ConversationParticipantCreateManyUserInput> = z.object({
  id: z.string().uuid().optional(),
  conversationId: z.string(),
  joinedAt: z.coerce.date().optional(),
  lastReadAt: z.coerce.date().optional().nullable(),
  role: z.lazy(() => ParticipantRoleSchema).optional(),
  isActive: z.boolean().optional(),
  isMuted: z.boolean().optional()
}).strict();

export default ConversationParticipantCreateManyUserInputSchema;
