import { z } from 'zod';

export const WorksheetMaterialScalarFieldEnumSchema = z.enum(['id','worksheetId','url','type']);

export default WorksheetMaterialScalarFieldEnumSchema;
