import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { ModeratorCommunityUpdateManyWithoutCommunityNestedInputSchema } from './ModeratorCommunityUpdateManyWithoutCommunityNestedInputSchema';
import { RoomGroupUpdateManyWithoutCommunityNestedInputSchema } from './RoomGroupUpdateManyWithoutCommunityNestedInputSchema';

export const CommunityUpdateWithoutMembershipsInputSchema: z.ZodType<Prisma.CommunityUpdateWithoutMembershipsInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrl: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  moderatorCommunities: z.lazy(() => ModeratorCommunityUpdateManyWithoutCommunityNestedInputSchema).optional(),
  roomGroups: z.lazy(() => RoomGroupUpdateManyWithoutCommunityNestedInputSchema).optional()
}).strict();

export default CommunityUpdateWithoutMembershipsInputSchema;
