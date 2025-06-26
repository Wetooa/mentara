import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateWithoutUserInputSchema } from './CommentCreateWithoutUserInputSchema';
import { CommentUncheckedCreateWithoutUserInputSchema } from './CommentUncheckedCreateWithoutUserInputSchema';
import { CommentCreateOrConnectWithoutUserInputSchema } from './CommentCreateOrConnectWithoutUserInputSchema';
import { CommentCreateManyUserInputEnvelopeSchema } from './CommentCreateManyUserInputEnvelopeSchema';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';

export const CommentCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.CommentCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutUserInputSchema),z.lazy(() => CommentCreateWithoutUserInputSchema).array(),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentCreateOrConnectWithoutUserInputSchema),z.lazy(() => CommentCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CommentCreateNestedManyWithoutUserInputSchema;
