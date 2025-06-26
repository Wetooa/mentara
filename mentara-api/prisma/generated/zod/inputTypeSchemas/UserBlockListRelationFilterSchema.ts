import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockWhereInputSchema } from './UserBlockWhereInputSchema';

export const UserBlockListRelationFilterSchema: z.ZodType<Prisma.UserBlockListRelationFilter> = z.object({
  every: z.lazy(() => UserBlockWhereInputSchema).optional(),
  some: z.lazy(() => UserBlockWhereInputSchema).optional(),
  none: z.lazy(() => UserBlockWhereInputSchema).optional()
}).strict();

export default UserBlockListRelationFilterSchema;
