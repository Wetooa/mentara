import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorIncludeSchema } from '../inputTypeSchemas/ModeratorIncludeSchema'
import { ModeratorUpdateInputSchema } from '../inputTypeSchemas/ModeratorUpdateInputSchema'
import { ModeratorUncheckedUpdateInputSchema } from '../inputTypeSchemas/ModeratorUncheckedUpdateInputSchema'
import { ModeratorWhereUniqueInputSchema } from '../inputTypeSchemas/ModeratorWhereUniqueInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { ModeratorCommunityFindManyArgsSchema } from "../outputTypeSchemas/ModeratorCommunityFindManyArgsSchema"
import { ModeratorCountOutputTypeArgsSchema } from "../outputTypeSchemas/ModeratorCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ModeratorSelectSchema: z.ZodType<Prisma.ModeratorSelect> = z.object({
  userId: z.boolean().optional(),
  permissions: z.boolean().optional(),
  assignedCommunities: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  moderatorCommunities: z.union([z.boolean(),z.lazy(() => ModeratorCommunityFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ModeratorCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ModeratorUpdateArgsSchema: z.ZodType<Prisma.ModeratorUpdateArgs> = z.object({
  select: ModeratorSelectSchema.optional(),
  include: z.lazy(() => ModeratorIncludeSchema).optional(),
  data: z.union([ ModeratorUpdateInputSchema,ModeratorUncheckedUpdateInputSchema ]),
  where: ModeratorWhereUniqueInputSchema,
}).strict() ;

export default ModeratorUpdateArgsSchema;
