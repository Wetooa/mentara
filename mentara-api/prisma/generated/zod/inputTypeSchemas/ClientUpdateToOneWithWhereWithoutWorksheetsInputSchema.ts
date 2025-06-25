import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { ClientUpdateWithoutWorksheetsInputSchema } from './ClientUpdateWithoutWorksheetsInputSchema';
import { ClientUncheckedUpdateWithoutWorksheetsInputSchema } from './ClientUncheckedUpdateWithoutWorksheetsInputSchema';

export const ClientUpdateToOneWithWhereWithoutWorksheetsInputSchema: z.ZodType<Prisma.ClientUpdateToOneWithWhereWithoutWorksheetsInput> = z.object({
  where: z.lazy(() => ClientWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ClientUpdateWithoutWorksheetsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutWorksheetsInputSchema) ]),
}).strict();

export default ClientUpdateToOneWithWhereWithoutWorksheetsInputSchema;
