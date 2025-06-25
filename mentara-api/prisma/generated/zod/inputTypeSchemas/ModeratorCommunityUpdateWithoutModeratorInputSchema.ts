import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { CommunityUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema } from './CommunityUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema';

export const ModeratorCommunityUpdateWithoutModeratorInputSchema: z.ZodType<Prisma.ModeratorCommunityUpdateWithoutModeratorInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  assignedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  community: z.lazy(() => CommunityUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema).optional()
}).strict();

export default ModeratorCommunityUpdateWithoutModeratorInputSchema;
