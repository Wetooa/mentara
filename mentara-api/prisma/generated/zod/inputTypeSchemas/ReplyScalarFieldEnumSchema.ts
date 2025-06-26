import { z } from 'zod';

export const ReplyScalarFieldEnumSchema = z.enum(['id','commentId','userId','content','createdAt','updatedAt']);

export default ReplyScalarFieldEnumSchema;
