import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityCreateWithoutModeratorInputSchema } from './ModeratorCommunityCreateWithoutModeratorInputSchema';
import { ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema } from './ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema';
import { ModeratorCommunityCreateOrConnectWithoutModeratorInputSchema } from './ModeratorCommunityCreateOrConnectWithoutModeratorInputSchema';
import { ModeratorCommunityUpsertWithWhereUniqueWithoutModeratorInputSchema } from './ModeratorCommunityUpsertWithWhereUniqueWithoutModeratorInputSchema';
import { ModeratorCommunityCreateManyModeratorInputEnvelopeSchema } from './ModeratorCommunityCreateManyModeratorInputEnvelopeSchema';
import { ModeratorCommunityWhereUniqueInputSchema } from './ModeratorCommunityWhereUniqueInputSchema';
import { ModeratorCommunityUpdateWithWhereUniqueWithoutModeratorInputSchema } from './ModeratorCommunityUpdateWithWhereUniqueWithoutModeratorInputSchema';
import { ModeratorCommunityUpdateManyWithWhereWithoutModeratorInputSchema } from './ModeratorCommunityUpdateManyWithWhereWithoutModeratorInputSchema';
import { ModeratorCommunityScalarWhereInputSchema } from './ModeratorCommunityScalarWhereInputSchema';

export const ModeratorCommunityUpdateManyWithoutModeratorNestedInputSchema: z.ZodType<Prisma.ModeratorCommunityUpdateManyWithoutModeratorNestedInput> = z.object({
  create: z.union([ z.lazy(() => ModeratorCommunityCreateWithoutModeratorInputSchema),z.lazy(() => ModeratorCommunityCreateWithoutModeratorInputSchema).array(),z.lazy(() => ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema),z.lazy(() => ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ModeratorCommunityCreateOrConnectWithoutModeratorInputSchema),z.lazy(() => ModeratorCommunityCreateOrConnectWithoutModeratorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ModeratorCommunityUpsertWithWhereUniqueWithoutModeratorInputSchema),z.lazy(() => ModeratorCommunityUpsertWithWhereUniqueWithoutModeratorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ModeratorCommunityCreateManyModeratorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),z.lazy(() => ModeratorCommunityWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),z.lazy(() => ModeratorCommunityWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),z.lazy(() => ModeratorCommunityWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),z.lazy(() => ModeratorCommunityWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ModeratorCommunityUpdateWithWhereUniqueWithoutModeratorInputSchema),z.lazy(() => ModeratorCommunityUpdateWithWhereUniqueWithoutModeratorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ModeratorCommunityUpdateManyWithWhereWithoutModeratorInputSchema),z.lazy(() => ModeratorCommunityUpdateManyWithWhereWithoutModeratorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ModeratorCommunityScalarWhereInputSchema),z.lazy(() => ModeratorCommunityScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ModeratorCommunityUpdateManyWithoutModeratorNestedInputSchema;
