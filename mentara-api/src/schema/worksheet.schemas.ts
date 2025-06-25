import { z } from 'zod';
import {
  WorksheetCreateInputSchema,
  WorksheetSubmissionCreateInputSchema,
  WorksheetUpdateInputSchema,
} from 'prisma/generated/zod/inputTypeSchemas';

export type WorksheetCreateInputDto = z.infer<
  typeof WorksheetCreateInputSchema
>;

export type WorksheetUpdateInputDto = z.infer<
  typeof WorksheetUpdateInputSchema
>;

export type WorksheetSubmissionCreateInputDto = z.infer<
  typeof WorksheetSubmissionCreateInputSchema
>;
