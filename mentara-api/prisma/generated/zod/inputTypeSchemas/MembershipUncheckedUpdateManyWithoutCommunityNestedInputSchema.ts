import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MembershipCreateWithoutCommunityInputSchema } from './MembershipCreateWithoutCommunityInputSchema';
import { MembershipUncheckedCreateWithoutCommunityInputSchema } from './MembershipUncheckedCreateWithoutCommunityInputSchema';
import { MembershipCreateOrConnectWithoutCommunityInputSchema } from './MembershipCreateOrConnectWithoutCommunityInputSchema';
import { MembershipUpsertWithWhereUniqueWithoutCommunityInputSchema } from './MembershipUpsertWithWhereUniqueWithoutCommunityInputSchema';
import { MembershipCreateManyCommunityInputEnvelopeSchema } from './MembershipCreateManyCommunityInputEnvelopeSchema';
import { MembershipWhereUniqueInputSchema } from './MembershipWhereUniqueInputSchema';
import { MembershipUpdateWithWhereUniqueWithoutCommunityInputSchema } from './MembershipUpdateWithWhereUniqueWithoutCommunityInputSchema';
import { MembershipUpdateManyWithWhereWithoutCommunityInputSchema } from './MembershipUpdateManyWithWhereWithoutCommunityInputSchema';
import { MembershipScalarWhereInputSchema } from './MembershipScalarWhereInputSchema';

export const MembershipUncheckedUpdateManyWithoutCommunityNestedInputSchema: z.ZodType<Prisma.MembershipUncheckedUpdateManyWithoutCommunityNestedInput> = z.object({
  create: z.union([ z.lazy(() => MembershipCreateWithoutCommunityInputSchema),z.lazy(() => MembershipCreateWithoutCommunityInputSchema).array(),z.lazy(() => MembershipUncheckedCreateWithoutCommunityInputSchema),z.lazy(() => MembershipUncheckedCreateWithoutCommunityInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MembershipCreateOrConnectWithoutCommunityInputSchema),z.lazy(() => MembershipCreateOrConnectWithoutCommunityInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MembershipUpsertWithWhereUniqueWithoutCommunityInputSchema),z.lazy(() => MembershipUpsertWithWhereUniqueWithoutCommunityInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MembershipCreateManyCommunityInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MembershipWhereUniqueInputSchema),z.lazy(() => MembershipWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MembershipWhereUniqueInputSchema),z.lazy(() => MembershipWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MembershipWhereUniqueInputSchema),z.lazy(() => MembershipWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MembershipWhereUniqueInputSchema),z.lazy(() => MembershipWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MembershipUpdateWithWhereUniqueWithoutCommunityInputSchema),z.lazy(() => MembershipUpdateWithWhereUniqueWithoutCommunityInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MembershipUpdateManyWithWhereWithoutCommunityInputSchema),z.lazy(() => MembershipUpdateManyWithWhereWithoutCommunityInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MembershipScalarWhereInputSchema),z.lazy(() => MembershipScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MembershipUncheckedUpdateManyWithoutCommunityNestedInputSchema;
