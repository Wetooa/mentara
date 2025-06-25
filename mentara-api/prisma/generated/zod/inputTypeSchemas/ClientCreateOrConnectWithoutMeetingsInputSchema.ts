import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientCreateWithoutMeetingsInputSchema } from './ClientCreateWithoutMeetingsInputSchema';
import { ClientUncheckedCreateWithoutMeetingsInputSchema } from './ClientUncheckedCreateWithoutMeetingsInputSchema';

export const ClientCreateOrConnectWithoutMeetingsInputSchema: z.ZodType<Prisma.ClientCreateOrConnectWithoutMeetingsInput> = z.object({
  where: z.lazy(() => ClientWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ClientCreateWithoutMeetingsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutMeetingsInputSchema) ]),
}).strict();

export default ClientCreateOrConnectWithoutMeetingsInputSchema;
