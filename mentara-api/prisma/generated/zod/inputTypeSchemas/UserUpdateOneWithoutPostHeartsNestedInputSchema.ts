import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutPostHeartsInputSchema } from './UserCreateWithoutPostHeartsInputSchema';
import { UserUncheckedCreateWithoutPostHeartsInputSchema } from './UserUncheckedCreateWithoutPostHeartsInputSchema';
import { UserCreateOrConnectWithoutPostHeartsInputSchema } from './UserCreateOrConnectWithoutPostHeartsInputSchema';
import { UserUpsertWithoutPostHeartsInputSchema } from './UserUpsertWithoutPostHeartsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutPostHeartsInputSchema } from './UserUpdateToOneWithWhereWithoutPostHeartsInputSchema';
import { UserUpdateWithoutPostHeartsInputSchema } from './UserUpdateWithoutPostHeartsInputSchema';
import { UserUncheckedUpdateWithoutPostHeartsInputSchema } from './UserUncheckedUpdateWithoutPostHeartsInputSchema';

export const UserUpdateOneWithoutPostHeartsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutPostHeartsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPostHeartsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPostHeartsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPostHeartsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutPostHeartsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutPostHeartsInputSchema),z.lazy(() => UserUpdateWithoutPostHeartsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPostHeartsInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneWithoutPostHeartsNestedInputSchema;
