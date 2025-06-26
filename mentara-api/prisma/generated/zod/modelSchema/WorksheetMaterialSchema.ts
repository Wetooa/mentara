import { z } from 'zod';

/////////////////////////////////////////
// WORKSHEET MATERIAL SCHEMA
/////////////////////////////////////////

export const WorksheetMaterialSchema = z.object({
  id: z.string().uuid(),
  worksheetId: z.string(),
  filename: z.string(),
  url: z.string(),
  fileSize: z.number().int().nullable(),
  fileType: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type WorksheetMaterial = z.infer<typeof WorksheetMaterialSchema>

export default WorksheetMaterialSchema;
