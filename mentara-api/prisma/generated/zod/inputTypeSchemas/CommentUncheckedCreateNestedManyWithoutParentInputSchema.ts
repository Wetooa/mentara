import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateWithoutParentInputSchema } from './CommentCreateWithoutParentInputSchema';
import { CommentUncheckedCreateWithoutParentInputSchema } from './CommentUncheckedCreateWithoutParentInputSchema';
import { CommentCreateOrConnectWithoutParentInputSchema } from './CommentCreateOrConnectWithoutParentInputSchema';
import { CommentCreateManyParentInputEnvelopeSchema } from './CommentCreateManyParentInputEnvelopeSchema';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';

export const CommentUncheckedCreateNestedManyWithoutParentInputSchema: z.ZodType<Prisma.CommentUncheckedCreateNestedManyWithoutParentInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutParentInputSchema),z.lazy(() => CommentCreateWithoutParentInputSchema).array(),z.lazy(() => CommentUncheckedCreateWithoutParentInputSchema),z.lazy(() => CommentUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentCreateOrConnectWithoutParentInputSchema),z.lazy(() => CommentCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentCreateManyParentInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CommentUncheckedCreateNestedManyWithoutParentInputSchema;
