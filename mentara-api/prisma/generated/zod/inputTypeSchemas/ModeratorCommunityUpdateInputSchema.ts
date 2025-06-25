import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { ModeratorUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema } from './ModeratorUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema';
import { CommunityUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema } from './CommunityUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema';

export const ModeratorCommunityUpdateInputSchema: z.ZodType<Prisma.ModeratorCommunityUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  assignedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  moderator: z.lazy(() => ModeratorUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema).optional(),
  community: z.lazy(() => CommunityUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema).optional()
}).strict();

export default ModeratorCommunityUpdateInputSchema;
