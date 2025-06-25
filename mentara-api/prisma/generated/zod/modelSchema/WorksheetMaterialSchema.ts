import { z } from 'zod';

/////////////////////////////////////////
// WORKSHEET MATERIAL SCHEMA
/////////////////////////////////////////

export const WorksheetMaterialSchema = z.object({
  id: z.string().uuid(),
  worksheetId: z.string(),
  url: z.string(),
  type: z.string().nullable(),
})

export type WorksheetMaterial = z.infer<typeof WorksheetMaterialSchema>

export default WorksheetMaterialSchema;
