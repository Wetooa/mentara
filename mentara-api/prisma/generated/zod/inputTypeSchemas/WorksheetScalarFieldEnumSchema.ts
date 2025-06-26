import { z } from 'zod';

export const WorksheetScalarFieldEnumSchema = z.enum(['id','clientId','therapistId','title','instructions','description','dueDate','status','isCompleted','submittedAt','feedback','createdAt','updatedAt']);

export default WorksheetScalarFieldEnumSchema;
