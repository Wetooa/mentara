import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateNestedManyWithoutDurationConfigInputSchema } from './MeetingCreateNestedManyWithoutDurationConfigInputSchema';

export const MeetingDurationCreateInputSchema: z.ZodType<Prisma.MeetingDurationCreateInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  duration: z.number().int(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  meetings: z.lazy(() => MeetingCreateNestedManyWithoutDurationConfigInputSchema).optional()
}).strict();

export default MeetingDurationCreateInputSchema;
