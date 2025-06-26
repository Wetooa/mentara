import { z } from 'zod';

export const PreAssessmentScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','clientId','questionnaires','answers','answerMatrix','scores','severityLevels','aiEstimate']);

export default PreAssessmentScalarFieldEnumSchema;
