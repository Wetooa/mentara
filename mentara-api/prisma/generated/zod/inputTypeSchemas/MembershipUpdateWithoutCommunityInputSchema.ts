import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneWithoutMembershipsNestedInputSchema } from './UserUpdateOneWithoutMembershipsNestedInputSchema';

export const MembershipUpdateWithoutCommunityInputSchema: z.ZodType<Prisma.MembershipUpdateWithoutCommunityInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  joinedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneWithoutMembershipsNestedInputSchema).optional()
}).strict();

export default MembershipUpdateWithoutCommunityInputSchema;
