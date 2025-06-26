import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutReviewsHelpfulInputSchema } from './UserCreateWithoutReviewsHelpfulInputSchema';
import { UserUncheckedCreateWithoutReviewsHelpfulInputSchema } from './UserUncheckedCreateWithoutReviewsHelpfulInputSchema';
import { UserCreateOrConnectWithoutReviewsHelpfulInputSchema } from './UserCreateOrConnectWithoutReviewsHelpfulInputSchema';
import { UserUpsertWithoutReviewsHelpfulInputSchema } from './UserUpsertWithoutReviewsHelpfulInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutReviewsHelpfulInputSchema } from './UserUpdateToOneWithWhereWithoutReviewsHelpfulInputSchema';
import { UserUpdateWithoutReviewsHelpfulInputSchema } from './UserUpdateWithoutReviewsHelpfulInputSchema';
import { UserUncheckedUpdateWithoutReviewsHelpfulInputSchema } from './UserUncheckedUpdateWithoutReviewsHelpfulInputSchema';

export const UserUpdateOneRequiredWithoutReviewsHelpfulNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutReviewsHelpfulNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutReviewsHelpfulInputSchema),z.lazy(() => UserUncheckedCreateWithoutReviewsHelpfulInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutReviewsHelpfulInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutReviewsHelpfulInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutReviewsHelpfulInputSchema),z.lazy(() => UserUpdateWithoutReviewsHelpfulInputSchema),z.lazy(() => UserUncheckedUpdateWithoutReviewsHelpfulInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutReviewsHelpfulNestedInputSchema;
