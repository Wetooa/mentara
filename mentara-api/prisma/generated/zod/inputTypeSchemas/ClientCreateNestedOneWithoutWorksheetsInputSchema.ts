import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutWorksheetsInputSchema } from './ClientCreateWithoutWorksheetsInputSchema';
import { ClientUncheckedCreateWithoutWorksheetsInputSchema } from './ClientUncheckedCreateWithoutWorksheetsInputSchema';
import { ClientCreateOrConnectWithoutWorksheetsInputSchema } from './ClientCreateOrConnectWithoutWorksheetsInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';

export const ClientCreateNestedOneWithoutWorksheetsInputSchema: z.ZodType<Prisma.ClientCreateNestedOneWithoutWorksheetsInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutWorksheetsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutWorksheetsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutWorksheetsInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional()
}).strict();

export default ClientCreateNestedOneWithoutWorksheetsInputSchema;
