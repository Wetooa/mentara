import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { ClientUpdateWithoutReviewsInputSchema } from './ClientUpdateWithoutReviewsInputSchema';
import { ClientUncheckedUpdateWithoutReviewsInputSchema } from './ClientUncheckedUpdateWithoutReviewsInputSchema';

export const ClientUpdateToOneWithWhereWithoutReviewsInputSchema: z.ZodType<Prisma.ClientUpdateToOneWithWhereWithoutReviewsInput> = z.object({
  where: z.lazy(() => ClientWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ClientUpdateWithoutReviewsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutReviewsInputSchema) ]),
}).strict();

export default ClientUpdateToOneWithWhereWithoutReviewsInputSchema;
