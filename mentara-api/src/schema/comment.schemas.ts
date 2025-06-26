import { z } from 'zod';
import {
  CommentCreateInputSchema,
  CommentUpdateInputSchema,
} from 'prisma/generated/zod/inputTypeSchemas';

export type CommentCreateInputDto = z.infer<typeof CommentCreateInputSchema>;
export type CommentUpdateInputDto = z.infer<typeof CommentUpdateInputSchema>;
