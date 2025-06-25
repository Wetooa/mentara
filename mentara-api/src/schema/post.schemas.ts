import { z } from 'zod';
import {
  CommentCreateInputSchema,
  PostFileCreateInputSchema,
  PostCreateInputSchema,
  PostUpdateInputSchema,
  ReplyFileCreateInputSchema,
} from 'prisma/generated/zod/inputTypeSchemas';

export type PostFileCreateInputDto = z.infer<typeof PostFileCreateInputSchema>;

export type ReplyFileCreateInputDto = z.infer<
  typeof ReplyFileCreateInputSchema
>;

export type CommentCreateInputDto = z.infer<typeof CommentCreateInputSchema>;

export type PostUpdateInputDto = z.infer<typeof PostUpdateInputSchema>;

export type PostCreateInputDto = z.infer<typeof PostCreateInputSchema>;
