import { z } from 'zod';

export const ConversationParticipantScalarFieldEnumSchema = z.enum(['id','conversationId','userId','joinedAt','lastReadAt','role','isActive','isMuted']);

export default ConversationParticipantScalarFieldEnumSchema;
