import { z } from 'zod';

export const ClientMedicalHistoryScalarFieldEnumSchema = z.enum(['id','clientId','condition','notes']);

export default ClientMedicalHistoryScalarFieldEnumSchema;
