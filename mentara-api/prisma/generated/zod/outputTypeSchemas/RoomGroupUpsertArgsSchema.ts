import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RoomGroupIncludeSchema } from '../inputTypeSchemas/RoomGroupIncludeSchema'
import { RoomGroupWhereUniqueInputSchema } from '../inputTypeSchemas/RoomGroupWhereUniqueInputSchema'
import { RoomGroupCreateInputSchema } from '../inputTypeSchemas/RoomGroupCreateInputSchema'
import { RoomGroupUncheckedCreateInputSchema } from '../inputTypeSchemas/RoomGroupUncheckedCreateInputSchema'
import { RoomGroupUpdateInputSchema } from '../inputTypeSchemas/RoomGroupUpdateInputSchema'
import { RoomGroupUncheckedUpdateInputSchema } from '../inputTypeSchemas/RoomGroupUncheckedUpdateInputSchema'
import { CommunityArgsSchema } from "../outputTypeSchemas/CommunityArgsSchema"
import { RoomFindManyArgsSchema } from "../outputTypeSchemas/RoomFindManyArgsSchema"
import { RoomGroupCountOutputTypeArgsSchema } from "../outputTypeSchemas/RoomGroupCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const RoomGroupSelectSchema: z.ZodType<Prisma.RoomGroupSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  order: z.boolean().optional(),
  communityId: z.boolean().optional(),
  community: z.union([z.boolean(),z.lazy(() => CommunityArgsSchema)]).optional(),
  rooms: z.union([z.boolean(),z.lazy(() => RoomFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => RoomGroupCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const RoomGroupUpsertArgsSchema: z.ZodType<Prisma.RoomGroupUpsertArgs> = z.object({
  select: RoomGroupSelectSchema.optional(),
  include: z.lazy(() => RoomGroupIncludeSchema).optional(),
  where: RoomGroupWhereUniqueInputSchema,
  create: z.union([ RoomGroupCreateInputSchema,RoomGroupUncheckedCreateInputSchema ]),
  update: z.union([ RoomGroupUpdateInputSchema,RoomGroupUncheckedUpdateInputSchema ]),
}).strict() ;

export default RoomGroupUpsertArgsSchema;
