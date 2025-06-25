import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomCreateWithoutPostsInputSchema } from './RoomCreateWithoutPostsInputSchema';
import { RoomUncheckedCreateWithoutPostsInputSchema } from './RoomUncheckedCreateWithoutPostsInputSchema';
import { RoomCreateOrConnectWithoutPostsInputSchema } from './RoomCreateOrConnectWithoutPostsInputSchema';
import { RoomWhereUniqueInputSchema } from './RoomWhereUniqueInputSchema';

export const RoomCreateNestedOneWithoutPostsInputSchema: z.ZodType<Prisma.RoomCreateNestedOneWithoutPostsInput> = z.object({
  create: z.union([ z.lazy(() => RoomCreateWithoutPostsInputSchema),z.lazy(() => RoomUncheckedCreateWithoutPostsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RoomCreateOrConnectWithoutPostsInputSchema).optional(),
  connect: z.lazy(() => RoomWhereUniqueInputSchema).optional()
}).strict();

export default RoomCreateNestedOneWithoutPostsInputSchema;
