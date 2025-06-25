import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartWhereUniqueInputSchema } from './CommentHeartWhereUniqueInputSchema';
import { CommentHeartUpdateWithoutUserInputSchema } from './CommentHeartUpdateWithoutUserInputSchema';
import { CommentHeartUncheckedUpdateWithoutUserInputSchema } from './CommentHeartUncheckedUpdateWithoutUserInputSchema';

export const CommentHeartUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CommentHeartUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => CommentHeartWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CommentHeartUpdateWithoutUserInputSchema),z.lazy(() => CommentHeartUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default CommentHeartUpdateWithWhereUniqueWithoutUserInputSchema;
