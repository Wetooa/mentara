import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PreAssessmentSelectSchema } from '../inputTypeSchemas/PreAssessmentSelectSchema';
import { PreAssessmentIncludeSchema } from '../inputTypeSchemas/PreAssessmentIncludeSchema';

export const PreAssessmentArgsSchema: z.ZodType<Prisma.PreAssessmentDefaultArgs> = z.object({
  select: z.lazy(() => PreAssessmentSelectSchema).optional(),
  include: z.lazy(() => PreAssessmentIncludeSchema).optional(),
}).strict();

export default PreAssessmentArgsSchema;
