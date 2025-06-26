import { z } from 'zod';

export const TherapistFilesScalarFieldEnumSchema = z.enum(['id','therapistId','fileUrl','createdAt','updatedAt']);

export default TherapistFilesScalarFieldEnumSchema;
