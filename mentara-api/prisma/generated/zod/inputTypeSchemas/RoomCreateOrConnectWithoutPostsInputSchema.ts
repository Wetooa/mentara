import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomWhereUniqueInputSchema } from './RoomWhereUniqueInputSchema';
import { RoomCreateWithoutPostsInputSchema } from './RoomCreateWithoutPostsInputSchema';
import { RoomUncheckedCreateWithoutPostsInputSchema } from './RoomUncheckedCreateWithoutPostsInputSchema';

export const RoomCreateOrConnectWithoutPostsInputSchema: z.ZodType<Prisma.RoomCreateOrConnectWithoutPostsInput> = z.object({
  where: z.lazy(() => RoomWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RoomCreateWithoutPostsInputSchema),z.lazy(() => RoomUncheckedCreateWithoutPostsInputSchema) ]),
}).strict();

export default RoomCreateOrConnectWithoutPostsInputSchema;
