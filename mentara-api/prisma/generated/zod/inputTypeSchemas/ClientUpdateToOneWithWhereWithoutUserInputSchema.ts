import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { ClientUpdateWithoutUserInputSchema } from './ClientUpdateWithoutUserInputSchema';
import { ClientUncheckedUpdateWithoutUserInputSchema } from './ClientUncheckedUpdateWithoutUserInputSchema';

export const ClientUpdateToOneWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ClientUpdateToOneWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => ClientWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ClientUpdateWithoutUserInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default ClientUpdateToOneWithWhereWithoutUserInputSchema;
