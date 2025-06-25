import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistWhereUniqueInputSchema } from './ClientTherapistWhereUniqueInputSchema';
import { ClientTherapistCreateWithoutTherapistInputSchema } from './ClientTherapistCreateWithoutTherapistInputSchema';
import { ClientTherapistUncheckedCreateWithoutTherapistInputSchema } from './ClientTherapistUncheckedCreateWithoutTherapistInputSchema';

export const ClientTherapistCreateOrConnectWithoutTherapistInputSchema: z.ZodType<Prisma.ClientTherapistCreateOrConnectWithoutTherapistInput> = z.object({
  where: z.lazy(() => ClientTherapistWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ClientTherapistCreateWithoutTherapistInputSchema),z.lazy(() => ClientTherapistUncheckedCreateWithoutTherapistInputSchema) ]),
}).strict();

export default ClientTherapistCreateOrConnectWithoutTherapistInputSchema;
