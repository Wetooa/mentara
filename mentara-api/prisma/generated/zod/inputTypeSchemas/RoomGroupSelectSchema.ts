import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommunityArgsSchema } from "../outputTypeSchemas/CommunityArgsSchema"
import { RoomFindManyArgsSchema } from "../outputTypeSchemas/RoomFindManyArgsSchema"
import { RoomGroupCountOutputTypeArgsSchema } from "../outputTypeSchemas/RoomGroupCountOutputTypeArgsSchema"

export const RoomGroupSelectSchema: z.ZodType<Prisma.RoomGroupSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  order: z.boolean().optional(),
  communityId: z.boolean().optional(),
  community: z.union([z.boolean(),z.lazy(() => CommunityArgsSchema)]).optional(),
  rooms: z.union([z.boolean(),z.lazy(() => RoomFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => RoomGroupCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default RoomGroupSelectSchema;
