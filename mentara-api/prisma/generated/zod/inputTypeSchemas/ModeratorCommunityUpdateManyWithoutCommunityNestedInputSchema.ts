import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityCreateWithoutCommunityInputSchema } from './ModeratorCommunityCreateWithoutCommunityInputSchema';
import { ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema } from './ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema';
import { ModeratorCommunityCreateOrConnectWithoutCommunityInputSchema } from './ModeratorCommunityCreateOrConnectWithoutCommunityInputSchema';
import { ModeratorCommunityUpsertWithWhereUniqueWithoutCommunityInputSchema } from './ModeratorCommunityUpsertWithWhereUniqueWithoutCommunityInputSchema';
import { ModeratorCommunityCreateManyCommunityInputEnvelopeSchema } from './ModeratorCommunityCreateManyCommunityInputEnvelopeSchema';
import { ModeratorCommunityWhereUniqueInputSchema } from './ModeratorCommunityWhereUniqueInputSchema';
import { ModeratorCommunityUpdateWithWhereUniqueWithoutCommunityInputSchema } from './ModeratorCommunityUpdateWithWhereUniqueWithoutCommunityInputSchema';
import { ModeratorCommunityUpdateManyWithWhereWithoutCommunityInputSchema } from './ModeratorCommunityUpdateManyWithWhereWithoutCommunityInputSchema';
import { ModeratorCommunityScalarWhereInputSchema } from './ModeratorCommunityScalarWhereInputSchema';

export const ModeratorCommunityUpdateManyWithoutCommunityNestedInputSchema: z.ZodType<Prisma.ModeratorCommunityUpdateManyWithoutCommunityNestedInput> = z.object({
  create: z.union([ z.lazy(() => ModeratorCommunityCreateWithoutCommunityInputSchema),z.lazy(() => ModeratorCommunityCreateWithoutCommunityInputSchema).array(),z.lazy(() => ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema),z.lazy(() => ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ModeratorCommunityCreateOrConnectWithoutCommunityInputSchema),z.lazy(() => ModeratorCommunityCreateOrConnectWithoutCommunityInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ModeratorCommunityUpsertWithWhereUniqueWithoutCommunityInputSchema),z.lazy(() => ModeratorCommunityUpsertWithWhereUniqueWithoutCommunityInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ModeratorCommunityCreateManyCommunityInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),z.lazy(() => ModeratorCommunityWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),z.lazy(() => ModeratorCommunityWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),z.lazy(() => ModeratorCommunityWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),z.lazy(() => ModeratorCommunityWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ModeratorCommunityUpdateWithWhereUniqueWithoutCommunityInputSchema),z.lazy(() => ModeratorCommunityUpdateWithWhereUniqueWithoutCommunityInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ModeratorCommunityUpdateManyWithWhereWithoutCommunityInputSchema),z.lazy(() => ModeratorCommunityUpdateManyWithWhereWithoutCommunityInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ModeratorCommunityScalarWhereInputSchema),z.lazy(() => ModeratorCommunityScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ModeratorCommunityUpdateManyWithoutCommunityNestedInputSchema;
