import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientUpdateWithoutWorksheetsInputSchema } from './ClientUpdateWithoutWorksheetsInputSchema';
import { ClientUncheckedUpdateWithoutWorksheetsInputSchema } from './ClientUncheckedUpdateWithoutWorksheetsInputSchema';
import { ClientCreateWithoutWorksheetsInputSchema } from './ClientCreateWithoutWorksheetsInputSchema';
import { ClientUncheckedCreateWithoutWorksheetsInputSchema } from './ClientUncheckedCreateWithoutWorksheetsInputSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const ClientUpsertWithoutWorksheetsInputSchema: z.ZodType<Prisma.ClientUpsertWithoutWorksheetsInput> = z.object({
  update: z.union([ z.lazy(() => ClientUpdateWithoutWorksheetsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutWorksheetsInputSchema) ]),
  create: z.union([ z.lazy(() => ClientCreateWithoutWorksheetsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutWorksheetsInputSchema) ]),
  where: z.lazy(() => ClientWhereInputSchema).optional()
}).strict();

export default ClientUpsertWithoutWorksheetsInputSchema;
