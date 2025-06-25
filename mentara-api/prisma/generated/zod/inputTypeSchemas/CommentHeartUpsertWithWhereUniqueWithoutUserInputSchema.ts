import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartWhereUniqueInputSchema } from './CommentHeartWhereUniqueInputSchema';
import { CommentHeartUpdateWithoutUserInputSchema } from './CommentHeartUpdateWithoutUserInputSchema';
import { CommentHeartUncheckedUpdateWithoutUserInputSchema } from './CommentHeartUncheckedUpdateWithoutUserInputSchema';
import { CommentHeartCreateWithoutUserInputSchema } from './CommentHeartCreateWithoutUserInputSchema';
import { CommentHeartUncheckedCreateWithoutUserInputSchema } from './CommentHeartUncheckedCreateWithoutUserInputSchema';

export const CommentHeartUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CommentHeartUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => CommentHeartWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CommentHeartUpdateWithoutUserInputSchema),z.lazy(() => CommentHeartUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => CommentHeartCreateWithoutUserInputSchema),z.lazy(() => CommentHeartUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default CommentHeartUpsertWithWhereUniqueWithoutUserInputSchema;
