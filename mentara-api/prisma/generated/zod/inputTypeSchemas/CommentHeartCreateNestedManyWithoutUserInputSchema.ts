import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartCreateWithoutUserInputSchema } from './CommentHeartCreateWithoutUserInputSchema';
import { CommentHeartUncheckedCreateWithoutUserInputSchema } from './CommentHeartUncheckedCreateWithoutUserInputSchema';
import { CommentHeartCreateOrConnectWithoutUserInputSchema } from './CommentHeartCreateOrConnectWithoutUserInputSchema';
import { CommentHeartCreateManyUserInputEnvelopeSchema } from './CommentHeartCreateManyUserInputEnvelopeSchema';
import { CommentHeartWhereUniqueInputSchema } from './CommentHeartWhereUniqueInputSchema';

export const CommentHeartCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.CommentHeartCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => CommentHeartCreateWithoutUserInputSchema),z.lazy(() => CommentHeartCreateWithoutUserInputSchema).array(),z.lazy(() => CommentHeartUncheckedCreateWithoutUserInputSchema),z.lazy(() => CommentHeartUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentHeartCreateOrConnectWithoutUserInputSchema),z.lazy(() => CommentHeartCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentHeartCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CommentHeartWhereUniqueInputSchema),z.lazy(() => CommentHeartWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CommentHeartCreateNestedManyWithoutUserInputSchema;
