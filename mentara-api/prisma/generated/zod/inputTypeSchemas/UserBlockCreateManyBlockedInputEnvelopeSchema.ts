import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockCreateManyBlockedInputSchema } from './UserBlockCreateManyBlockedInputSchema';

export const UserBlockCreateManyBlockedInputEnvelopeSchema: z.ZodType<Prisma.UserBlockCreateManyBlockedInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserBlockCreateManyBlockedInputSchema),z.lazy(() => UserBlockCreateManyBlockedInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default UserBlockCreateManyBlockedInputEnvelopeSchema;
