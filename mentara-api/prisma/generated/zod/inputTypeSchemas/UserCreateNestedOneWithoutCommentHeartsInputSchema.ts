import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutCommentHeartsInputSchema } from './UserCreateWithoutCommentHeartsInputSchema';
import { UserUncheckedCreateWithoutCommentHeartsInputSchema } from './UserUncheckedCreateWithoutCommentHeartsInputSchema';
import { UserCreateOrConnectWithoutCommentHeartsInputSchema } from './UserCreateOrConnectWithoutCommentHeartsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutCommentHeartsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutCommentHeartsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutCommentHeartsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCommentHeartsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCommentHeartsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutCommentHeartsInputSchema;
