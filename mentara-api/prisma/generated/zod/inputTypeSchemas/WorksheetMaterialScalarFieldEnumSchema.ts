import { z } from 'zod';

export const WorksheetMaterialScalarFieldEnumSchema = z.enum(['id','worksheetId','filename','url','fileSize','fileType','createdAt']);

export default WorksheetMaterialScalarFieldEnumSchema;
