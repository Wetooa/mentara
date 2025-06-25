import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'

/////////////////////////////////////////
// PRE ASSESSMENT SCHEMA
/////////////////////////////////////////

export const PreAssessmentSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  clientId: z.string(),
  questionnaires: JsonValueSchema,
  answers: JsonValueSchema,
  answerMatrix: JsonValueSchema,
  scores: JsonValueSchema,
  severityLevels: JsonValueSchema,
  aiEstimate: JsonValueSchema,
})

export type PreAssessment = z.infer<typeof PreAssessmentSchema>

export default PreAssessmentSchema;
