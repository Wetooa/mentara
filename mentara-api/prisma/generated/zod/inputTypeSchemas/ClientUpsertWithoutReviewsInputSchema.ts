import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientUpdateWithoutReviewsInputSchema } from './ClientUpdateWithoutReviewsInputSchema';
import { ClientUncheckedUpdateWithoutReviewsInputSchema } from './ClientUncheckedUpdateWithoutReviewsInputSchema';
import { ClientCreateWithoutReviewsInputSchema } from './ClientCreateWithoutReviewsInputSchema';
import { ClientUncheckedCreateWithoutReviewsInputSchema } from './ClientUncheckedCreateWithoutReviewsInputSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const ClientUpsertWithoutReviewsInputSchema: z.ZodType<Prisma.ClientUpsertWithoutReviewsInput> = z.object({
  update: z.union([ z.lazy(() => ClientUpdateWithoutReviewsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutReviewsInputSchema) ]),
  create: z.union([ z.lazy(() => ClientCreateWithoutReviewsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutReviewsInputSchema) ]),
  where: z.lazy(() => ClientWhereInputSchema).optional()
}).strict();

export default ClientUpsertWithoutReviewsInputSchema;
