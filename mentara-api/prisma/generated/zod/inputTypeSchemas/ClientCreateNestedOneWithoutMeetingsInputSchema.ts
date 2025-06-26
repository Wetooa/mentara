import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutMeetingsInputSchema } from './ClientCreateWithoutMeetingsInputSchema';
import { ClientUncheckedCreateWithoutMeetingsInputSchema } from './ClientUncheckedCreateWithoutMeetingsInputSchema';
import { ClientCreateOrConnectWithoutMeetingsInputSchema } from './ClientCreateOrConnectWithoutMeetingsInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';

export const ClientCreateNestedOneWithoutMeetingsInputSchema: z.ZodType<Prisma.ClientCreateNestedOneWithoutMeetingsInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutMeetingsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutMeetingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutMeetingsInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional()
}).strict();

export default ClientCreateNestedOneWithoutMeetingsInputSchema;
