import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutReviewsHelpfulInputSchema } from './UserCreateWithoutReviewsHelpfulInputSchema';
import { UserUncheckedCreateWithoutReviewsHelpfulInputSchema } from './UserUncheckedCreateWithoutReviewsHelpfulInputSchema';

export const UserCreateOrConnectWithoutReviewsHelpfulInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutReviewsHelpfulInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutReviewsHelpfulInputSchema),z.lazy(() => UserUncheckedCreateWithoutReviewsHelpfulInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutReviewsHelpfulInputSchema;
