import { z } from 'zod';

export const RoomGroupScalarFieldEnumSchema = z.enum(['id','name','order','communityId']);

export default RoomGroupScalarFieldEnumSchema;
