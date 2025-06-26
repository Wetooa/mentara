import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockCreateManyBlockerInputSchema } from './UserBlockCreateManyBlockerInputSchema';

export const UserBlockCreateManyBlockerInputEnvelopeSchema: z.ZodType<Prisma.UserBlockCreateManyBlockerInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserBlockCreateManyBlockerInputSchema),z.lazy(() => UserBlockCreateManyBlockerInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default UserBlockCreateManyBlockerInputEnvelopeSchema;
