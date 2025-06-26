import { z } from 'zod';

export const MessageReactionScalarFieldEnumSchema = z.enum(['id','messageId','userId','emoji','createdAt']);

export default MessageReactionScalarFieldEnumSchema;
