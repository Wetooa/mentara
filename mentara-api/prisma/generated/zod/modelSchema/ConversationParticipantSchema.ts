import { z } from 'zod';
import { ParticipantRoleSchema } from '../inputTypeSchemas/ParticipantRoleSchema'

/////////////////////////////////////////
// CONVERSATION PARTICIPANT SCHEMA
/////////////////////////////////////////

export const ConversationParticipantSchema = z.object({
  role: ParticipantRoleSchema,
  id: z.string().uuid(),
  conversationId: z.string(),
  userId: z.string(),
  joinedAt: z.coerce.date(),
  lastReadAt: z.coerce.date().nullable(),
  isActive: z.boolean(),
  isMuted: z.boolean(),
})

export type ConversationParticipant = z.infer<typeof ConversationParticipantSchema>

export default ConversationParticipantSchema;
