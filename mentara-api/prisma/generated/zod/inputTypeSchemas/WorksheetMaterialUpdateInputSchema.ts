import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { WorksheetUpdateOneRequiredWithoutMaterialsNestedInputSchema } from './WorksheetUpdateOneRequiredWithoutMaterialsNestedInputSchema';

export const WorksheetMaterialUpdateInputSchema: z.ZodType<Prisma.WorksheetMaterialUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  worksheet: z.lazy(() => WorksheetUpdateOneRequiredWithoutMaterialsNestedInputSchema).optional()
}).strict();

export default WorksheetMaterialUpdateInputSchema;
