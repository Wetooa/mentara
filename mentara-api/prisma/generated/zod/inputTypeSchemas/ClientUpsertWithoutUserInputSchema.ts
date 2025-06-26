import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientUpdateWithoutUserInputSchema } from './ClientUpdateWithoutUserInputSchema';
import { ClientUncheckedUpdateWithoutUserInputSchema } from './ClientUncheckedUpdateWithoutUserInputSchema';
import { ClientCreateWithoutUserInputSchema } from './ClientCreateWithoutUserInputSchema';
import { ClientUncheckedCreateWithoutUserInputSchema } from './ClientUncheckedCreateWithoutUserInputSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const ClientUpsertWithoutUserInputSchema: z.ZodType<Prisma.ClientUpsertWithoutUserInput> = z.object({
  update: z.union([ z.lazy(() => ClientUpdateWithoutUserInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => ClientCreateWithoutUserInputSchema),z.lazy(() => ClientUncheckedCreateWithoutUserInputSchema) ]),
  where: z.lazy(() => ClientWhereInputSchema).optional()
}).strict();

export default ClientUpsertWithoutUserInputSchema;
