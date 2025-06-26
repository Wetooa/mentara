import { z } from 'zod';

export const CommentFileScalarFieldEnumSchema = z.enum(['id','commentId','url','type']);

export default CommentFileScalarFieldEnumSchema;
