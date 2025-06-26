import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { CommentUpdateOneRequiredWithoutFilesNestedInputSchema } from './CommentUpdateOneRequiredWithoutFilesNestedInputSchema';

export const CommentFileUpdateInputSchema: z.ZodType<Prisma.CommentFileUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  comment: z.lazy(() => CommentUpdateOneRequiredWithoutFilesNestedInputSchema).optional()
}).strict();

export default CommentFileUpdateInputSchema;
