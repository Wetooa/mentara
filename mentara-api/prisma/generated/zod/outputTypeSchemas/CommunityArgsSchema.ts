import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommunitySelectSchema } from '../inputTypeSchemas/CommunitySelectSchema';
import { CommunityIncludeSchema } from '../inputTypeSchemas/CommunityIncludeSchema';

export const CommunityArgsSchema: z.ZodType<Prisma.CommunityDefaultArgs> = z.object({
  select: z.lazy(() => CommunitySelectSchema).optional(),
  include: z.lazy(() => CommunityIncludeSchema).optional(),
}).strict();

export default CommunityArgsSchema;
