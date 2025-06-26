import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CommunityCreateManyInputSchema: z.ZodType<Prisma.CommunityCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default CommunityCreateManyInputSchema;
