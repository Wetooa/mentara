import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientCreateWithoutWorksheetsInputSchema } from './ClientCreateWithoutWorksheetsInputSchema';
import { ClientUncheckedCreateWithoutWorksheetsInputSchema } from './ClientUncheckedCreateWithoutWorksheetsInputSchema';

export const ClientCreateOrConnectWithoutWorksheetsInputSchema: z.ZodType<Prisma.ClientCreateOrConnectWithoutWorksheetsInput> = z.object({
  where: z.lazy(() => ClientWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ClientCreateWithoutWorksheetsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutWorksheetsInputSchema) ]),
}).strict();

export default ClientCreateOrConnectWithoutWorksheetsInputSchema;
