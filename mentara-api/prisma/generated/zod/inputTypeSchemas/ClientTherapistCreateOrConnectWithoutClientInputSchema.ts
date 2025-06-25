import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistWhereUniqueInputSchema } from './ClientTherapistWhereUniqueInputSchema';
import { ClientTherapistCreateWithoutClientInputSchema } from './ClientTherapistCreateWithoutClientInputSchema';
import { ClientTherapistUncheckedCreateWithoutClientInputSchema } from './ClientTherapistUncheckedCreateWithoutClientInputSchema';

export const ClientTherapistCreateOrConnectWithoutClientInputSchema: z.ZodType<Prisma.ClientTherapistCreateOrConnectWithoutClientInput> = z.object({
  where: z.lazy(() => ClientTherapistWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ClientTherapistCreateWithoutClientInputSchema),z.lazy(() => ClientTherapistUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default ClientTherapistCreateOrConnectWithoutClientInputSchema;
