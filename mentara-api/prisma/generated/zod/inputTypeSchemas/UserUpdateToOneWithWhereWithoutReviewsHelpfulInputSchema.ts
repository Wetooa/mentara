import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutReviewsHelpfulInputSchema } from './UserUpdateWithoutReviewsHelpfulInputSchema';
import { UserUncheckedUpdateWithoutReviewsHelpfulInputSchema } from './UserUncheckedUpdateWithoutReviewsHelpfulInputSchema';

export const UserUpdateToOneWithWhereWithoutReviewsHelpfulInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutReviewsHelpfulInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutReviewsHelpfulInputSchema),z.lazy(() => UserUncheckedUpdateWithoutReviewsHelpfulInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutReviewsHelpfulInputSchema;
