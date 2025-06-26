import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutReviewsHelpfulInputSchema } from './UserCreateWithoutReviewsHelpfulInputSchema';
import { UserUncheckedCreateWithoutReviewsHelpfulInputSchema } from './UserUncheckedCreateWithoutReviewsHelpfulInputSchema';
import { UserCreateOrConnectWithoutReviewsHelpfulInputSchema } from './UserCreateOrConnectWithoutReviewsHelpfulInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutReviewsHelpfulInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutReviewsHelpfulInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutReviewsHelpfulInputSchema),z.lazy(() => UserUncheckedCreateWithoutReviewsHelpfulInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutReviewsHelpfulInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutReviewsHelpfulInputSchema;
