import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateWithoutReviewsInputSchema } from './MeetingCreateWithoutReviewsInputSchema';
import { MeetingUncheckedCreateWithoutReviewsInputSchema } from './MeetingUncheckedCreateWithoutReviewsInputSchema';
import { MeetingCreateOrConnectWithoutReviewsInputSchema } from './MeetingCreateOrConnectWithoutReviewsInputSchema';
import { MeetingUpsertWithoutReviewsInputSchema } from './MeetingUpsertWithoutReviewsInputSchema';
import { MeetingWhereInputSchema } from './MeetingWhereInputSchema';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingUpdateToOneWithWhereWithoutReviewsInputSchema } from './MeetingUpdateToOneWithWhereWithoutReviewsInputSchema';
import { MeetingUpdateWithoutReviewsInputSchema } from './MeetingUpdateWithoutReviewsInputSchema';
import { MeetingUncheckedUpdateWithoutReviewsInputSchema } from './MeetingUncheckedUpdateWithoutReviewsInputSchema';

export const MeetingUpdateOneWithoutReviewsNestedInputSchema: z.ZodType<Prisma.MeetingUpdateOneWithoutReviewsNestedInput> = z.object({
  create: z.union([ z.lazy(() => MeetingCreateWithoutReviewsInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => MeetingCreateOrConnectWithoutReviewsInputSchema).optional(),
  upsert: z.lazy(() => MeetingUpsertWithoutReviewsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => MeetingWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => MeetingWhereInputSchema) ]).optional(),
  connect: z.lazy(() => MeetingWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => MeetingUpdateToOneWithWhereWithoutReviewsInputSchema),z.lazy(() => MeetingUpdateWithoutReviewsInputSchema),z.lazy(() => MeetingUncheckedUpdateWithoutReviewsInputSchema) ]).optional(),
}).strict();

export default MeetingUpdateOneWithoutReviewsNestedInputSchema;
