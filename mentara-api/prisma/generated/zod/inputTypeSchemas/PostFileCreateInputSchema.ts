import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateNestedOneWithoutFilesInputSchema } from './PostCreateNestedOneWithoutFilesInputSchema';

export const PostFileCreateInputSchema: z.ZodType<Prisma.PostFileCreateInput> = z.object({
  id: z.string().uuid().optional(),
  url: z.string(),
  type: z.string().optional().nullable(),
  post: z.lazy(() => PostCreateNestedOneWithoutFilesInputSchema)
}).strict();

export default PostFileCreateInputSchema;
