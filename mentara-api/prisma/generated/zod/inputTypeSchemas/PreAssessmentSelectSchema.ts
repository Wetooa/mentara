import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"

export const PreAssessmentSelectSchema: z.ZodType<Prisma.PreAssessmentSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  clientId: z.boolean().optional(),
  questionnaires: z.boolean().optional(),
  answers: z.boolean().optional(),
  answerMatrix: z.boolean().optional(),
  scores: z.boolean().optional(),
  severityLevels: z.boolean().optional(),
  aiEstimate: z.boolean().optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
}).strict()

export default PreAssessmentSelectSchema;
