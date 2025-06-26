import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { PostUpdateOneRequiredWithoutFilesNestedInputSchema } from './PostUpdateOneRequiredWithoutFilesNestedInputSchema';

export const PostFileUpdateInputSchema: z.ZodType<Prisma.PostFileUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  post: z.lazy(() => PostUpdateOneRequiredWithoutFilesNestedInputSchema).optional()
}).strict();

export default PostFileUpdateInputSchema;
