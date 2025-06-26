import { z } from 'zod';

export const ConversationScalarFieldEnumSchema = z.enum(['id','type','title','isActive','lastMessageAt','createdAt','updatedAt']);

export default ConversationScalarFieldEnumSchema;
