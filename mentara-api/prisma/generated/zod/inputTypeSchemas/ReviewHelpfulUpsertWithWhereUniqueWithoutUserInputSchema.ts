import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulWhereUniqueInputSchema } from './ReviewHelpfulWhereUniqueInputSchema';
import { ReviewHelpfulUpdateWithoutUserInputSchema } from './ReviewHelpfulUpdateWithoutUserInputSchema';
import { ReviewHelpfulUncheckedUpdateWithoutUserInputSchema } from './ReviewHelpfulUncheckedUpdateWithoutUserInputSchema';
import { ReviewHelpfulCreateWithoutUserInputSchema } from './ReviewHelpfulCreateWithoutUserInputSchema';
import { ReviewHelpfulUncheckedCreateWithoutUserInputSchema } from './ReviewHelpfulUncheckedCreateWithoutUserInputSchema';

export const ReviewHelpfulUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReviewHelpfulUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReviewHelpfulUpdateWithoutUserInputSchema),z.lazy(() => ReviewHelpfulUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewHelpfulCreateWithoutUserInputSchema),z.lazy(() => ReviewHelpfulUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default ReviewHelpfulUpsertWithWhereUniqueWithoutUserInputSchema;
