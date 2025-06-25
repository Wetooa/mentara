import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { ReplyUpdateOneRequiredWithoutFilesNestedInputSchema } from './ReplyUpdateOneRequiredWithoutFilesNestedInputSchema';

export const ReplyFileUpdateInputSchema: z.ZodType<Prisma.ReplyFileUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reply: z.lazy(() => ReplyUpdateOneRequiredWithoutFilesNestedInputSchema).optional()
}).strict();

export default ReplyFileUpdateInputSchema;
