import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityCreateWithoutCommunityInputSchema } from './ModeratorCommunityCreateWithoutCommunityInputSchema';
import { ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema } from './ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema';
import { ModeratorCommunityCreateOrConnectWithoutCommunityInputSchema } from './ModeratorCommunityCreateOrConnectWithoutCommunityInputSchema';
import { ModeratorCommunityCreateManyCommunityInputEnvelopeSchema } from './ModeratorCommunityCreateManyCommunityInputEnvelopeSchema';
import { ModeratorCommunityWhereUniqueInputSchema } from './ModeratorCommunityWhereUniqueInputSchema';

export const ModeratorCommunityUncheckedCreateNestedManyWithoutCommunityInputSchema: z.ZodType<Prisma.ModeratorCommunityUncheckedCreateNestedManyWithoutCommunityInput> = z.object({
  create: z.union([ z.lazy(() => ModeratorCommunityCreateWithoutCommunityInputSchema),z.lazy(() => ModeratorCommunityCreateWithoutCommunityInputSchema).array(),z.lazy(() => ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema),z.lazy(() => ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ModeratorCommunityCreateOrConnectWithoutCommunityInputSchema),z.lazy(() => ModeratorCommunityCreateOrConnectWithoutCommunityInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ModeratorCommunityCreateManyCommunityInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),z.lazy(() => ModeratorCommunityWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ModeratorCommunityUncheckedCreateNestedManyWithoutCommunityInputSchema;
