import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomCreateWithoutPostsInputSchema } from './RoomCreateWithoutPostsInputSchema';
import { RoomUncheckedCreateWithoutPostsInputSchema } from './RoomUncheckedCreateWithoutPostsInputSchema';
import { RoomCreateOrConnectWithoutPostsInputSchema } from './RoomCreateOrConnectWithoutPostsInputSchema';
import { RoomUpsertWithoutPostsInputSchema } from './RoomUpsertWithoutPostsInputSchema';
import { RoomWhereInputSchema } from './RoomWhereInputSchema';
import { RoomWhereUniqueInputSchema } from './RoomWhereUniqueInputSchema';
import { RoomUpdateToOneWithWhereWithoutPostsInputSchema } from './RoomUpdateToOneWithWhereWithoutPostsInputSchema';
import { RoomUpdateWithoutPostsInputSchema } from './RoomUpdateWithoutPostsInputSchema';
import { RoomUncheckedUpdateWithoutPostsInputSchema } from './RoomUncheckedUpdateWithoutPostsInputSchema';

export const RoomUpdateOneWithoutPostsNestedInputSchema: z.ZodType<Prisma.RoomUpdateOneWithoutPostsNestedInput> = z.object({
  create: z.union([ z.lazy(() => RoomCreateWithoutPostsInputSchema),z.lazy(() => RoomUncheckedCreateWithoutPostsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RoomCreateOrConnectWithoutPostsInputSchema).optional(),
  upsert: z.lazy(() => RoomUpsertWithoutPostsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => RoomWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => RoomWhereInputSchema) ]).optional(),
  connect: z.lazy(() => RoomWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => RoomUpdateToOneWithWhereWithoutPostsInputSchema),z.lazy(() => RoomUpdateWithoutPostsInputSchema),z.lazy(() => RoomUncheckedUpdateWithoutPostsInputSchema) ]).optional(),
}).strict();

export default RoomUpdateOneWithoutPostsNestedInputSchema;
