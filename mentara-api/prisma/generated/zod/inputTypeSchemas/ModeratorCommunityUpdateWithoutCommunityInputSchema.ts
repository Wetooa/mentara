import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { ModeratorUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema } from './ModeratorUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema';

export const ModeratorCommunityUpdateWithoutCommunityInputSchema: z.ZodType<Prisma.ModeratorCommunityUpdateWithoutCommunityInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  assignedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  moderator: z.lazy(() => ModeratorUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema).optional()
}).strict();

export default ModeratorCommunityUpdateWithoutCommunityInputSchema;
