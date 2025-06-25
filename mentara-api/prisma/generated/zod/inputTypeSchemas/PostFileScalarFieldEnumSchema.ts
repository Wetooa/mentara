import { z } from 'zod';

export const PostFileScalarFieldEnumSchema = z.enum(['id','postId','url','type']);

export default PostFileScalarFieldEnumSchema;
