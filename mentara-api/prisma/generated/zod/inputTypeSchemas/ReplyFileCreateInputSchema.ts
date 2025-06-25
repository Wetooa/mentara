import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyCreateNestedOneWithoutFilesInputSchema } from './ReplyCreateNestedOneWithoutFilesInputSchema';

export const ReplyFileCreateInputSchema: z.ZodType<Prisma.ReplyFileCreateInput> = z.object({
  id: z.string().uuid().optional(),
  url: z.string(),
  type: z.string().optional().nullable(),
  reply: z.lazy(() => ReplyCreateNestedOneWithoutFilesInputSchema)
}).strict();

export default ReplyFileCreateInputSchema;
