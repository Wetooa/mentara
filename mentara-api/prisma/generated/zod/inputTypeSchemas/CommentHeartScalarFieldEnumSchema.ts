import { z } from 'zod';

export const CommentHeartScalarFieldEnumSchema = z.enum(['id','commentId','createdAt','userId']);

export default CommentHeartScalarFieldEnumSchema;
