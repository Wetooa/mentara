import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCreatepermissionsInputSchema } from './ModeratorCreatepermissionsInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ModeratorCommunityUncheckedCreateNestedManyWithoutModeratorInputSchema } from './ModeratorCommunityUncheckedCreateNestedManyWithoutModeratorInputSchema';

export const ModeratorUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.ModeratorUncheckedCreateWithoutUserInput> = z.object({
  permissions: z.union([ z.lazy(() => ModeratorCreatepermissionsInputSchema),z.string().array() ]).optional(),
  assignedCommunities: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  moderatorCommunities: z.lazy(() => ModeratorCommunityUncheckedCreateNestedManyWithoutModeratorInputSchema).optional()
}).strict();

export default ModeratorUncheckedCreateWithoutUserInputSchema;
