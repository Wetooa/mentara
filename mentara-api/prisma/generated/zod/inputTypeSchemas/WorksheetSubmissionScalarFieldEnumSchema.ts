import { z } from 'zod';

export const WorksheetSubmissionScalarFieldEnumSchema = z.enum(['id','worksheetId','clientId','filename','url','fileSize','fileType','content','createdAt']);

export default WorksheetSubmissionScalarFieldEnumSchema;
