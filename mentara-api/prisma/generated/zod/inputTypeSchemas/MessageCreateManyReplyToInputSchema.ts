import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageTypeSchema } from './MessageTypeSchema';

export const MessageCreateManyReplyToInputSchema: z.ZodType<Prisma.MessageCreateManyReplyToInput> = z.object({
  id: z.string().uuid().optional(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  messageType: z.lazy(() => MessageTypeSchema).optional(),
  attachmentUrl: z.string().optional().nullable(),
  attachmentName: z.string().optional().nullable(),
  attachmentSize: z.number().int().optional().nullable(),
  isEdited: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  editedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default MessageCreateManyReplyToInputSchema;
