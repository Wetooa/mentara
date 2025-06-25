import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCreatepermissionsInputSchema } from './ModeratorCreatepermissionsInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const ModeratorCreateManyInputSchema: z.ZodType<Prisma.ModeratorCreateManyInput> = z.object({
  userId: z.string(),
  permissions: z.union([ z.lazy(() => ModeratorCreatepermissionsInputSchema),z.string().array() ]).optional(),
  assignedCommunities: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default ModeratorCreateManyInputSchema;
