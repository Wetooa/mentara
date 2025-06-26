import { z } from 'zod';

export const MessageReadReceiptScalarFieldEnumSchema = z.enum(['id','messageId','userId','readAt']);

export default MessageReadReceiptScalarFieldEnumSchema;
