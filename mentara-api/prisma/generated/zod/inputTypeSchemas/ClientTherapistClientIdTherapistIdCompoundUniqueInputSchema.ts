import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ClientTherapistClientIdTherapistIdCompoundUniqueInputSchema: z.ZodType<Prisma.ClientTherapistClientIdTherapistIdCompoundUniqueInput> = z.object({
  clientId: z.string(),
  therapistId: z.string()
}).strict();

export default ClientTherapistClientIdTherapistIdCompoundUniqueInputSchema;
