import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateWithoutPostInputSchema } from './CommentCreateWithoutPostInputSchema';
import { CommentUncheckedCreateWithoutPostInputSchema } from './CommentUncheckedCreateWithoutPostInputSchema';
import { CommentCreateOrConnectWithoutPostInputSchema } from './CommentCreateOrConnectWithoutPostInputSchema';
import { CommentUpsertWithWhereUniqueWithoutPostInputSchema } from './CommentUpsertWithWhereUniqueWithoutPostInputSchema';
import { CommentCreateManyPostInputEnvelopeSchema } from './CommentCreateManyPostInputEnvelopeSchema';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentUpdateWithWhereUniqueWithoutPostInputSchema } from './CommentUpdateWithWhereUniqueWithoutPostInputSchema';
import { CommentUpdateManyWithWhereWithoutPostInputSchema } from './CommentUpdateManyWithWhereWithoutPostInputSchema';
import { CommentScalarWhereInputSchema } from './CommentScalarWhereInputSchema';

export const CommentUpdateManyWithoutPostNestedInputSchema: z.ZodType<Prisma.CommentUpdateManyWithoutPostNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutPostInputSchema),z.lazy(() => CommentCreateWithoutPostInputSchema).array(),z.lazy(() => CommentUncheckedCreateWithoutPostInputSchema),z.lazy(() => CommentUncheckedCreateWithoutPostInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentCreateOrConnectWithoutPostInputSchema),z.lazy(() => CommentCreateOrConnectWithoutPostInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CommentUpsertWithWhereUniqueWithoutPostInputSchema),z.lazy(() => CommentUpsertWithWhereUniqueWithoutPostInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentCreateManyPostInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CommentUpdateWithWhereUniqueWithoutPostInputSchema),z.lazy(() => CommentUpdateWithWhereUniqueWithoutPostInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CommentUpdateManyWithWhereWithoutPostInputSchema),z.lazy(() => CommentUpdateManyWithWhereWithoutPostInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CommentScalarWhereInputSchema),z.lazy(() => CommentScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CommentUpdateManyWithoutPostNestedInputSchema;
