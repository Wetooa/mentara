import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ParticipantRoleSchema } from './ParticipantRoleSchema';

export const EnumParticipantRoleFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumParticipantRoleFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => ParticipantRoleSchema).optional()
}).strict();

export default EnumParticipantRoleFieldUpdateOperationsInputSchema;
