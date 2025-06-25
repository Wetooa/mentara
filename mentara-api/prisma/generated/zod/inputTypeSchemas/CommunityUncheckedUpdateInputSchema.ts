import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { MembershipUncheckedUpdateManyWithoutCommunityNestedInputSchema } from './MembershipUncheckedUpdateManyWithoutCommunityNestedInputSchema';
import { ModeratorCommunityUncheckedUpdateManyWithoutCommunityNestedInputSchema } from './ModeratorCommunityUncheckedUpdateManyWithoutCommunityNestedInputSchema';
import { RoomGroupUncheckedUpdateManyWithoutCommunityNestedInputSchema } from './RoomGroupUncheckedUpdateManyWithoutCommunityNestedInputSchema';

export const CommunityUncheckedUpdateInputSchema: z.ZodType<Prisma.CommunityUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrl: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  memberships: z.lazy(() => MembershipUncheckedUpdateManyWithoutCommunityNestedInputSchema).optional(),
  moderatorCommunities: z.lazy(() => ModeratorCommunityUncheckedUpdateManyWithoutCommunityNestedInputSchema).optional(),
  roomGroups: z.lazy(() => RoomGroupUncheckedUpdateManyWithoutCommunityNestedInputSchema).optional()
}).strict();

export default CommunityUncheckedUpdateInputSchema;
