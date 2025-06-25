import { z } from 'zod';

export const ReplyHeartScalarFieldEnumSchema = z.enum(['id','replyId','userId','createdAt']);

export default ReplyHeartScalarFieldEnumSchema;
