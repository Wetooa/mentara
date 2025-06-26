import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RoomGroupIncludeSchema } from '../inputTypeSchemas/RoomGroupIncludeSchema'
import { RoomGroupWhereInputSchema } from '../inputTypeSchemas/RoomGroupWhereInputSchema'
import { RoomGroupOrderByWithRelationInputSchema } from '../inputTypeSchemas/RoomGroupOrderByWithRelationInputSchema'
import { RoomGroupWhereUniqueInputSchema } from '../inputTypeSchemas/RoomGroupWhereUniqueInputSchema'
import { RoomGroupScalarFieldEnumSchema } from '../inputTypeSchemas/RoomGroupScalarFieldEnumSchema'
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

export const RoomGroupFindFirstArgsSchema: z.ZodType<Prisma.RoomGroupFindFirstArgs> = z.object({
  select: RoomGroupSelectSchema.optional(),
  include: z.lazy(() => RoomGroupIncludeSchema).optional(),
  where: RoomGroupWhereInputSchema.optional(),
  orderBy: z.union([ RoomGroupOrderByWithRelationInputSchema.array(),RoomGroupOrderByWithRelationInputSchema ]).optional(),
  cursor: RoomGroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RoomGroupScalarFieldEnumSchema,RoomGroupScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default RoomGroupFindFirstArgsSchema;
