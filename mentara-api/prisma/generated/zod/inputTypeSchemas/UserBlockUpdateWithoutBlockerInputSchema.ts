import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneRequiredWithoutBlockedByNestedInputSchema } from './UserUpdateOneRequiredWithoutBlockedByNestedInputSchema';

export const UserBlockUpdateWithoutBlockerInputSchema: z.ZodType<Prisma.UserBlockUpdateWithoutBlockerInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  reason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  blocked: z.lazy(() => UserUpdateOneRequiredWithoutBlockedByNestedInputSchema).optional()
}).strict();

export default UserBlockUpdateWithoutBlockerInputSchema;
