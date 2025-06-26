import { z } from 'zod';

export const CommentScalarFieldEnumSchema = z.enum(['id','postId','userId','content','heartCount','parentId','createdAt','updatedAt']);

export default CommentScalarFieldEnumSchema;
