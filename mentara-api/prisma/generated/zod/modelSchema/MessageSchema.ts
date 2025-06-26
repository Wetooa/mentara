import { z } from 'zod';
import { MessageTypeSchema } from '../inputTypeSchemas/MessageTypeSchema'

/////////////////////////////////////////
// MESSAGE SCHEMA
/////////////////////////////////////////

export const MessageSchema = z.object({
  messageType: MessageTypeSchema,
  id: z.string().uuid(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  attachmentUrl: z.string().nullable(),
  attachmentName: z.string().nullable(),
  attachmentSize: z.number().int().nullable(),
  replyToId: z.string().nullable(),
  isEdited: z.boolean(),
  isDeleted: z.boolean(),
  editedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Message = z.infer<typeof MessageSchema>

export default MessageSchema;
