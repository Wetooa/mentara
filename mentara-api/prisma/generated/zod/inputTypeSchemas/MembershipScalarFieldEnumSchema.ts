import { z } from 'zod';

export const MembershipScalarFieldEnumSchema = z.enum(['id','communityId','role','joinedAt','userId']);

export default MembershipScalarFieldEnumSchema;
