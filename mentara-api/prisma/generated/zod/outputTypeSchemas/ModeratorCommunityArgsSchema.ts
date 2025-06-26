import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorCommunitySelectSchema } from '../inputTypeSchemas/ModeratorCommunitySelectSchema';
import { ModeratorCommunityIncludeSchema } from '../inputTypeSchemas/ModeratorCommunityIncludeSchema';

export const ModeratorCommunityArgsSchema: z.ZodType<Prisma.ModeratorCommunityDefaultArgs> = z.object({
  select: z.lazy(() => ModeratorCommunitySelectSchema).optional(),
  include: z.lazy(() => ModeratorCommunityIncludeSchema).optional(),
}).strict();

export default ModeratorCommunityArgsSchema;
