import { PrismaClient, FileStatus, AttachmentEntityType, AttachmentPurpose } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function migrateTherapistFiles() {
  console.log('Starting migration of TherapistFiles to File model...');

  try {
    // Get all existing therapist files
    const therapistFiles = await prisma.therapistFiles.findMany({
      include: {
        therapist: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log(`Found ${therapistFiles.length} therapist files to migrate`);

    let migrated = 0;
    let errors = 0;

    for (const therapistFile of therapistFiles) {
      try {
        // Extract file information
        const fileName = path.basename(therapistFile.fileUrl);
        const storagePath = therapistFile.fileUrl.startsWith('/') 
          ? therapistFile.fileUrl.substring(1) 
          : therapistFile.fileUrl;

        // Try to determine file size if file exists
        let fileSize = 0;
        const fullPath = path.join(process.cwd(), storagePath);
        try {
          if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            fileSize = stats.size;
          }
        } catch (error) {
          console.warn(`Could not get file size for ${fullPath}:`, error);
        }

        // Determine MIME type from file extension
        const ext = path.extname(fileName).toLowerCase();
        let mimeType = 'application/octet-stream'; // default
        switch (ext) {
          case '.pdf':
            mimeType = 'application/pdf';
            break;
          case '.jpg':
          case '.jpeg':
            mimeType = 'image/jpeg';
            break;
          case '.png':
            mimeType = 'image/png';
            break;
          case '.doc':
            mimeType = 'application/msword';
            break;
          case '.docx':
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
        }

        // Create File record
        const file = await prisma.file.create({
          data: {
            filename: fileName,
            displayName: fileName,
            mimeType: mimeType,
            size: fileSize,
            storagePath: storagePath,
            uploadedBy: therapistFile.therapistId,
            status: FileStatus.UPLOADED,
          },
        });

        // Create FileAttachment record
        await prisma.fileAttachment.create({
          data: {
            fileId: file.id,
            entityType: AttachmentEntityType.THERAPIST_APPLICATION,
            entityId: therapistFile.therapistId,
            purpose: AttachmentPurpose.DOCUMENT,
          },
        });

        console.log(`✓ Migrated file: ${fileName} (ID: ${therapistFile.id} -> ${file.id})`);
        migrated++;

      } catch (error) {
        console.error(`✗ Error migrating file ${therapistFile.id}:`, error);
        errors++;
      }
    }

    console.log(`\nMigration completed:`);
    console.log(`  ✓ Successfully migrated: ${migrated} files`);
    console.log(`  ✗ Errors: ${errors} files`);

    if (errors === 0 && migrated > 0) {
      console.log(`\nAll files migrated successfully. You can now safely remove the TherapistFiles table.`);
      console.log(`To remove the old table, add this to a new migration:`);
      console.log(`DROP TABLE "TherapistFiles";`);
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateTherapistFiles();
}

export { migrateTherapistFiles };