import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutWorksheetSubmissionsInputSchema } from './ClientCreateWithoutWorksheetSubmissionsInputSchema';
import { ClientUncheckedCreateWithoutWorksheetSubmissionsInputSchema } from './ClientUncheckedCreateWithoutWorksheetSubmissionsInputSchema';
import { ClientCreateOrConnectWithoutWorksheetSubmissionsInputSchema } from './ClientCreateOrConnectWithoutWorksheetSubmissionsInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';

export const ClientCreateNestedOneWithoutWorksheetSubmissionsInputSchema: z.ZodType<Prisma.ClientCreateNestedOneWithoutWorksheetSubmissionsInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutWorksheetSubmissionsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutWorksheetSubmissionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutWorksheetSubmissionsInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional()
}).strict();

export default ClientCreateNestedOneWithoutWorksheetSubmissionsInputSchema;
