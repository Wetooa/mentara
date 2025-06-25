import { z } from 'zod';

export const ReplyFileScalarFieldEnumSchema = z.enum(['id','replyId','url','type']);

export default ReplyFileScalarFieldEnumSchema;
