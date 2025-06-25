import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutCommentHeartsInputSchema } from './UserCreateWithoutCommentHeartsInputSchema';
import { UserUncheckedCreateWithoutCommentHeartsInputSchema } from './UserUncheckedCreateWithoutCommentHeartsInputSchema';
import { UserCreateOrConnectWithoutCommentHeartsInputSchema } from './UserCreateOrConnectWithoutCommentHeartsInputSchema';
import { UserUpsertWithoutCommentHeartsInputSchema } from './UserUpsertWithoutCommentHeartsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutCommentHeartsInputSchema } from './UserUpdateToOneWithWhereWithoutCommentHeartsInputSchema';
import { UserUpdateWithoutCommentHeartsInputSchema } from './UserUpdateWithoutCommentHeartsInputSchema';
import { UserUncheckedUpdateWithoutCommentHeartsInputSchema } from './UserUncheckedUpdateWithoutCommentHeartsInputSchema';

export const UserUpdateOneWithoutCommentHeartsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutCommentHeartsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutCommentHeartsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCommentHeartsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCommentHeartsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutCommentHeartsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutCommentHeartsInputSchema),z.lazy(() => UserUpdateWithoutCommentHeartsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutCommentHeartsInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneWithoutCommentHeartsNestedInputSchema;
