import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartWhereUniqueInputSchema } from './CommentHeartWhereUniqueInputSchema';
import { CommentHeartCreateWithoutUserInputSchema } from './CommentHeartCreateWithoutUserInputSchema';
import { CommentHeartUncheckedCreateWithoutUserInputSchema } from './CommentHeartUncheckedCreateWithoutUserInputSchema';

export const CommentHeartCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.CommentHeartCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => CommentHeartWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CommentHeartCreateWithoutUserInputSchema),z.lazy(() => CommentHeartUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default CommentHeartCreateOrConnectWithoutUserInputSchema;
