import { z } from 'zod';

export const CommentScalarFieldEnumSchema = z.enum(['id','postId','userId','content','createdAt','updatedAt']);

export default CommentScalarFieldEnumSchema;
