import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RoomIncludeSchema } from '../inputTypeSchemas/RoomIncludeSchema'
import { RoomUpdateInputSchema } from '../inputTypeSchemas/RoomUpdateInputSchema'
import { RoomUncheckedUpdateInputSchema } from '../inputTypeSchemas/RoomUncheckedUpdateInputSchema'
import { RoomWhereUniqueInputSchema } from '../inputTypeSchemas/RoomWhereUniqueInputSchema'
import { RoomGroupArgsSchema } from "../outputTypeSchemas/RoomGroupArgsSchema"
import { PostFindManyArgsSchema } from "../outputTypeSchemas/PostFindManyArgsSchema"
import { RoomCountOutputTypeArgsSchema } from "../outputTypeSchemas/RoomCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const RoomSelectSchema: z.ZodType<Prisma.RoomSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  order: z.boolean().optional(),
  roomGroupId: z.boolean().optional(),
  roomGroup: z.union([z.boolean(),z.lazy(() => RoomGroupArgsSchema)]).optional(),
  posts: z.union([z.boolean(),z.lazy(() => PostFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => RoomCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const RoomUpdateArgsSchema: z.ZodType<Prisma.RoomUpdateArgs> = z.object({
  select: RoomSelectSchema.optional(),
  include: z.lazy(() => RoomIncludeSchema).optional(),
  data: z.union([ RoomUpdateInputSchema,RoomUncheckedUpdateInputSchema ]),
  where: RoomWhereUniqueInputSchema,
}).strict() ;

export default RoomUpdateArgsSchema;
