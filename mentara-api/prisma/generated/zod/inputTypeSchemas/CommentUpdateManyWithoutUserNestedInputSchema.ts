import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateWithoutUserInputSchema } from './CommentCreateWithoutUserInputSchema';
import { CommentUncheckedCreateWithoutUserInputSchema } from './CommentUncheckedCreateWithoutUserInputSchema';
import { CommentCreateOrConnectWithoutUserInputSchema } from './CommentCreateOrConnectWithoutUserInputSchema';
import { CommentUpsertWithWhereUniqueWithoutUserInputSchema } from './CommentUpsertWithWhereUniqueWithoutUserInputSchema';
import { CommentCreateManyUserInputEnvelopeSchema } from './CommentCreateManyUserInputEnvelopeSchema';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentUpdateWithWhereUniqueWithoutUserInputSchema } from './CommentUpdateWithWhereUniqueWithoutUserInputSchema';
import { CommentUpdateManyWithWhereWithoutUserInputSchema } from './CommentUpdateManyWithWhereWithoutUserInputSchema';
import { CommentScalarWhereInputSchema } from './CommentScalarWhereInputSchema';

export const CommentUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.CommentUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutUserInputSchema),z.lazy(() => CommentCreateWithoutUserInputSchema).array(),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentCreateOrConnectWithoutUserInputSchema),z.lazy(() => CommentCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CommentUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => CommentUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CommentUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => CommentUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CommentUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => CommentUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CommentScalarWhereInputSchema),z.lazy(() => CommentScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CommentUpdateManyWithoutUserNestedInputSchema;
