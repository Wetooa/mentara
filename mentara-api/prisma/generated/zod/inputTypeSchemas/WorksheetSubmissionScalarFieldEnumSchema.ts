import { z } from 'zod';

export const WorksheetSubmissionScalarFieldEnumSchema = z.enum(['id','worksheetId','clientId','content','createdAt']);

export default WorksheetSubmissionScalarFieldEnumSchema;
