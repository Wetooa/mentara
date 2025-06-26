import { z } from 'zod';

/////////////////////////////////////////
// MESSAGE READ RECEIPT SCHEMA
/////////////////////////////////////////

export const MessageReadReceiptSchema = z.object({
  id: z.string().uuid(),
  messageId: z.string(),
  userId: z.string(),
  readAt: z.coerce.date(),
})

export type MessageReadReceipt = z.infer<typeof MessageReadReceiptSchema>

export default MessageReadReceiptSchema;
