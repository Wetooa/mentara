import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutReviewsHelpfulInputSchema } from './UserUpdateWithoutReviewsHelpfulInputSchema';
import { UserUncheckedUpdateWithoutReviewsHelpfulInputSchema } from './UserUncheckedUpdateWithoutReviewsHelpfulInputSchema';
import { UserCreateWithoutReviewsHelpfulInputSchema } from './UserCreateWithoutReviewsHelpfulInputSchema';
import { UserUncheckedCreateWithoutReviewsHelpfulInputSchema } from './UserUncheckedCreateWithoutReviewsHelpfulInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutReviewsHelpfulInputSchema: z.ZodType<Prisma.UserUpsertWithoutReviewsHelpfulInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutReviewsHelpfulInputSchema),z.lazy(() => UserUncheckedUpdateWithoutReviewsHelpfulInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutReviewsHelpfulInputSchema),z.lazy(() => UserUncheckedCreateWithoutReviewsHelpfulInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutReviewsHelpfulInputSchema;
