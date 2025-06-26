import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyFileWhereInputSchema } from './ReplyFileWhereInputSchema';

export const ReplyFileListRelationFilterSchema: z.ZodType<Prisma.ReplyFileListRelationFilter> = z.object({
  every: z.lazy(() => ReplyFileWhereInputSchema).optional(),
  some: z.lazy(() => ReplyFileWhereInputSchema).optional(),
  none: z.lazy(() => ReplyFileWhereInputSchema).optional()
}).strict();

export default ReplyFileListRelationFilterSchema;
