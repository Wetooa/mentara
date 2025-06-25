import { z } from 'zod';

export const PostHeartScalarFieldEnumSchema = z.enum(['id','postId','createdAt','userId']);

export default PostHeartScalarFieldEnumSchema;
