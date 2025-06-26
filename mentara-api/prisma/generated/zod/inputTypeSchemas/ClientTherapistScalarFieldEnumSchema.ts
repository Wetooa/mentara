import { z } from 'zod';

export const ClientTherapistScalarFieldEnumSchema = z.enum(['id','clientId','therapistId','assignedAt','status','notes','score']);

export default ClientTherapistScalarFieldEnumSchema;
