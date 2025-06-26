import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ParticipantRoleSchema } from './ParticipantRoleSchema';

export const ConversationParticipantUncheckedCreateWithoutConversationInputSchema: z.ZodType<Prisma.ConversationParticipantUncheckedCreateWithoutConversationInput> = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  joinedAt: z.coerce.date().optional(),
  lastReadAt: z.coerce.date().optional().nullable(),
  role: z.lazy(() => ParticipantRoleSchema).optional(),
  isActive: z.boolean().optional(),
  isMuted: z.boolean().optional()
}).strict();

export default ConversationParticipantUncheckedCreateWithoutConversationInputSchema;
