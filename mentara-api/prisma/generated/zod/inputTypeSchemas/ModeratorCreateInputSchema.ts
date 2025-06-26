import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCreatepermissionsInputSchema } from './ModeratorCreatepermissionsInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { UserCreateNestedOneWithoutModeratorInputSchema } from './UserCreateNestedOneWithoutModeratorInputSchema';
import { ModeratorCommunityCreateNestedManyWithoutModeratorInputSchema } from './ModeratorCommunityCreateNestedManyWithoutModeratorInputSchema';

export const ModeratorCreateInputSchema: z.ZodType<Prisma.ModeratorCreateInput> = z.object({
  permissions: z.union([ z.lazy(() => ModeratorCreatepermissionsInputSchema),z.string().array() ]).optional(),
  assignedCommunities: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutModeratorInputSchema),
  moderatorCommunities: z.lazy(() => ModeratorCommunityCreateNestedManyWithoutModeratorInputSchema).optional()
}).strict();

export default ModeratorCreateInputSchema;
