import { z } from 'zod';

export const MessageScalarFieldEnumSchema = z.enum(['id','conversationId','senderId','content','messageType','attachmentUrl','attachmentName','attachmentSize','replyToId','isEdited','isDeleted','editedAt','createdAt','updatedAt']);

export default MessageScalarFieldEnumSchema;
