import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ClientCreateNestedOneWithoutPreAssessmentInputSchema } from './ClientCreateNestedOneWithoutPreAssessmentInputSchema';

export const PreAssessmentCreateInputSchema: z.ZodType<Prisma.PreAssessmentCreateInput> = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  questionnaires: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  answers: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  answerMatrix: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  scores: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  severityLevels: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  aiEstimate: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  client: z.lazy(() => ClientCreateNestedOneWithoutPreAssessmentInputSchema)
}).strict();

export default PreAssessmentCreateInputSchema;
