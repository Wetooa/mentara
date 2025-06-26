import { z } from 'zod';

export const PostScalarFieldEnumSchema = z.enum(['id','title','content','createdAt','updatedAt','userId','roomId']);

export default PostScalarFieldEnumSchema;
