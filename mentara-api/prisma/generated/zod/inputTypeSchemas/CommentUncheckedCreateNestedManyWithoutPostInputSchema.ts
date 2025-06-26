import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateWithoutPostInputSchema } from './CommentCreateWithoutPostInputSchema';
import { CommentUncheckedCreateWithoutPostInputSchema } from './CommentUncheckedCreateWithoutPostInputSchema';
import { CommentCreateOrConnectWithoutPostInputSchema } from './CommentCreateOrConnectWithoutPostInputSchema';
import { CommentCreateManyPostInputEnvelopeSchema } from './CommentCreateManyPostInputEnvelopeSchema';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';

export const CommentUncheckedCreateNestedManyWithoutPostInputSchema: z.ZodType<Prisma.CommentUncheckedCreateNestedManyWithoutPostInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutPostInputSchema),z.lazy(() => CommentCreateWithoutPostInputSchema).array(),z.lazy(() => CommentUncheckedCreateWithoutPostInputSchema),z.lazy(() => CommentUncheckedCreateWithoutPostInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentCreateOrConnectWithoutPostInputSchema),z.lazy(() => CommentCreateOrConnectWithoutPostInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentCreateManyPostInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CommentUncheckedCreateNestedManyWithoutPostInputSchema;
