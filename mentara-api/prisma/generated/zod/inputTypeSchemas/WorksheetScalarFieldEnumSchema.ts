import { z } from 'zod';

export const WorksheetScalarFieldEnumSchema = z.enum(['id','clientId','therapistId','title','description','createdAt','updatedAt']);

export default WorksheetScalarFieldEnumSchema;
