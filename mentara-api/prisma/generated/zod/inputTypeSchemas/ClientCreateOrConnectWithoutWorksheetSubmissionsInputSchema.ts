import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientCreateWithoutWorksheetSubmissionsInputSchema } from './ClientCreateWithoutWorksheetSubmissionsInputSchema';
import { ClientUncheckedCreateWithoutWorksheetSubmissionsInputSchema } from './ClientUncheckedCreateWithoutWorksheetSubmissionsInputSchema';

export const ClientCreateOrConnectWithoutWorksheetSubmissionsInputSchema: z.ZodType<Prisma.ClientCreateOrConnectWithoutWorksheetSubmissionsInput> =
  z
    .object({
      where: z.lazy(() => ClientWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ClientCreateWithoutWorksheetSubmissionsInputSchema),
        z.lazy(
          () => ClientUncheckedCreateWithoutWorksheetSubmissionsInputSchema,
        ),
      ]),
    })
    .strict();

export default ClientCreateOrConnectWithoutWorksheetSubmissionsInputSchema;
