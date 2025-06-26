import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulCreateWithoutUserInputSchema } from './ReviewHelpfulCreateWithoutUserInputSchema';
import { ReviewHelpfulUncheckedCreateWithoutUserInputSchema } from './ReviewHelpfulUncheckedCreateWithoutUserInputSchema';
import { ReviewHelpfulCreateOrConnectWithoutUserInputSchema } from './ReviewHelpfulCreateOrConnectWithoutUserInputSchema';
import { ReviewHelpfulUpsertWithWhereUniqueWithoutUserInputSchema } from './ReviewHelpfulUpsertWithWhereUniqueWithoutUserInputSchema';
import { ReviewHelpfulCreateManyUserInputEnvelopeSchema } from './ReviewHelpfulCreateManyUserInputEnvelopeSchema';
import { ReviewHelpfulWhereUniqueInputSchema } from './ReviewHelpfulWhereUniqueInputSchema';
import { ReviewHelpfulUpdateWithWhereUniqueWithoutUserInputSchema } from './ReviewHelpfulUpdateWithWhereUniqueWithoutUserInputSchema';
import { ReviewHelpfulUpdateManyWithWhereWithoutUserInputSchema } from './ReviewHelpfulUpdateManyWithWhereWithoutUserInputSchema';
import { ReviewHelpfulScalarWhereInputSchema } from './ReviewHelpfulScalarWhereInputSchema';

export const ReviewHelpfulUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ReviewHelpfulUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewHelpfulCreateWithoutUserInputSchema),z.lazy(() => ReviewHelpfulCreateWithoutUserInputSchema).array(),z.lazy(() => ReviewHelpfulUncheckedCreateWithoutUserInputSchema),z.lazy(() => ReviewHelpfulUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewHelpfulCreateOrConnectWithoutUserInputSchema),z.lazy(() => ReviewHelpfulCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewHelpfulUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ReviewHelpfulUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewHelpfulCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),z.lazy(() => ReviewHelpfulWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),z.lazy(() => ReviewHelpfulWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),z.lazy(() => ReviewHelpfulWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),z.lazy(() => ReviewHelpfulWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewHelpfulUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ReviewHelpfulUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewHelpfulUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ReviewHelpfulUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewHelpfulScalarWhereInputSchema),z.lazy(() => ReviewHelpfulScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ReviewHelpfulUpdateManyWithoutUserNestedInputSchema;
