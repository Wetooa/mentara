import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorUpdatepermissionsInputSchema } from './ModeratorUpdatepermissionsInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { ModeratorCommunityUncheckedUpdateManyWithoutModeratorNestedInputSchema } from './ModeratorCommunityUncheckedUpdateManyWithoutModeratorNestedInputSchema';

export const ModeratorUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.ModeratorUncheckedUpdateWithoutUserInput> = z.object({
  permissions: z.union([ z.lazy(() => ModeratorUpdatepermissionsInputSchema),z.string().array() ]).optional(),
  assignedCommunities: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  moderatorCommunities: z.lazy(() => ModeratorCommunityUncheckedUpdateManyWithoutModeratorNestedInputSchema).optional()
}).strict();

export default ModeratorUncheckedUpdateWithoutUserInputSchema;
