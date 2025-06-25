import { z } from 'zod';
import { PreAssessmentCreateInputSchema } from 'prisma/generated/zod/inputTypeSchemas';

export type CreatePreAssessmentDto = z.infer<
  typeof PreAssessmentCreateInputSchema
>;
