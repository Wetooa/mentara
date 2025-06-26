import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingUncheckedCreateNestedManyWithoutDurationConfigInputSchema } from './MeetingUncheckedCreateNestedManyWithoutDurationConfigInputSchema';

export const MeetingDurationUncheckedCreateInputSchema: z.ZodType<Prisma.MeetingDurationUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  duration: z.number().int(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  meetings: z.lazy(() => MeetingUncheckedCreateNestedManyWithoutDurationConfigInputSchema).optional()
}).strict();

export default MeetingDurationUncheckedCreateInputSchema;
