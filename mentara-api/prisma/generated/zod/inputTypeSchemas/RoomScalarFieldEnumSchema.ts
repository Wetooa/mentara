import { z } from 'zod';

export const RoomScalarFieldEnumSchema = z.enum(['id','name','order','roomGroupId']);

export default RoomScalarFieldEnumSchema;
