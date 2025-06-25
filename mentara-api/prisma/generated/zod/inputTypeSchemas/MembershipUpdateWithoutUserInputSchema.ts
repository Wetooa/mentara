import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { CommunityUpdateOneRequiredWithoutMembershipsNestedInputSchema } from './CommunityUpdateOneRequiredWithoutMembershipsNestedInputSchema';

export const MembershipUpdateWithoutUserInputSchema: z.ZodType<Prisma.MembershipUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  joinedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  community: z.lazy(() => CommunityUpdateOneRequiredWithoutMembershipsNestedInputSchema).optional()
}).strict();

export default MembershipUpdateWithoutUserInputSchema;
