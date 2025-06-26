import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateWithoutHeartsInputSchema } from './CommentCreateWithoutHeartsInputSchema';
import { CommentUncheckedCreateWithoutHeartsInputSchema } from './CommentUncheckedCreateWithoutHeartsInputSchema';
import { CommentCreateOrConnectWithoutHeartsInputSchema } from './CommentCreateOrConnectWithoutHeartsInputSchema';
import { CommentUpsertWithoutHeartsInputSchema } from './CommentUpsertWithoutHeartsInputSchema';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentUpdateToOneWithWhereWithoutHeartsInputSchema } from './CommentUpdateToOneWithWhereWithoutHeartsInputSchema';
import { CommentUpdateWithoutHeartsInputSchema } from './CommentUpdateWithoutHeartsInputSchema';
import { CommentUncheckedUpdateWithoutHeartsInputSchema } from './CommentUncheckedUpdateWithoutHeartsInputSchema';

export const CommentUpdateOneRequiredWithoutHeartsNestedInputSchema: z.ZodType<Prisma.CommentUpdateOneRequiredWithoutHeartsNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutHeartsInputSchema),z.lazy(() => CommentUncheckedCreateWithoutHeartsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CommentCreateOrConnectWithoutHeartsInputSchema).optional(),
  upsert: z.lazy(() => CommentUpsertWithoutHeartsInputSchema).optional(),
  connect: z.lazy(() => CommentWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CommentUpdateToOneWithWhereWithoutHeartsInputSchema),z.lazy(() => CommentUpdateWithoutHeartsInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutHeartsInputSchema) ]).optional(),
}).strict();

export default CommentUpdateOneRequiredWithoutHeartsNestedInputSchema;
