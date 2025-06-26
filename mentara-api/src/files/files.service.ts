import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import {
  File,
  FileStatus,
  ScanStatus,
  AttachmentEntityType,
  AttachmentPurpose,
} from '@prisma/client';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    filename: string;
    mimeType: string;
    size: number;
    storagePath: string;
    uploadedBy: string;
    displayName?: string;
    storageUrl?: string;
    bucketName?: string;
  }): Promise<File> {
    return this.prisma.file.create({
      data: {
        ...data,
        status: FileStatus.UPLOADING,
        scanStatus: ScanStatus.PENDING,
      },
    });
  }

  async findAll(
    uploadedBy?: string,
    status?: FileStatus,
    mimeType?: string,
  ): Promise<File[]> {
    const where: any = {};

    if (uploadedBy) where.uploadedBy = uploadedBy;
    if (status) where.status = status;
    if (mimeType) where.mimeType = { contains: mimeType };

    return this.prisma.file.findMany({
      where,
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<File | null> {
    return this.prisma.file.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        attachments: true,
        versions: true,
      },
    });
  }

  async update(id: string, data: Partial<File>): Promise<File> {
    const file = await this.findOne(id);
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return this.prisma.file.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: FileStatus): Promise<File> {
    return this.update(id, { status });
  }

  async updateScanStatus(
    id: string,
    scanStatus: ScanStatus,
    scanResult?: string,
  ): Promise<File> {
    return this.update(id, {
      scanStatus,
      scanResult,
      scannedAt: new Date(),
    });
  }

  async delete(id: string): Promise<File> {
    const file = await this.findOne(id);
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return this.prisma.file.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async attachToEntity(
    fileId: string,
    entityType: AttachmentEntityType,
    entityId: string,
    purpose: AttachmentPurpose = AttachmentPurpose.GENERAL,
    order?: number,
    caption?: string,
  ) {
    const file = await this.findOne(fileId);
    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }

    return this.prisma.fileAttachment.create({
      data: {
        fileId,
        entityType,
        entityId,
        purpose,
        order,
        caption,
      },
    });
  }

  async getAttachments(entityType: AttachmentEntityType, entityId: string) {
    return this.prisma.fileAttachment.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        file: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async createVersion(
    fileId: string,
    data: {
      filename: string;
      size: number;
      mimeType: string;
      storagePath: string;
      hash?: string;
      description?: string;
      createdBy: string;
    },
  ) {
    const file = await this.findOne(fileId);
    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }

    // Get the next version number
    const lastVersion = await this.prisma.fileVersion.findFirst({
      where: { fileId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = lastVersion ? lastVersion.version + 1 : 1;

    // Deactivate current active version
    await this.prisma.fileVersion.updateMany({
      where: { fileId, isActive: true },
      data: { isActive: false },
    });

    // Create new version
    return this.prisma.fileVersion.create({
      data: {
        ...data,
        fileId,
        version: nextVersion,
        isActive: true,
      },
    });
  }

  async getVersions(fileId: string) {
    return this.prisma.fileVersion.findMany({
      where: { fileId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { version: 'desc' },
    });
  }

  async createShare(
    fileId: string,
    data: {
      shareType: string;
      sharedBy: string;
      password?: string;
      maxDownloads?: number;
      expiresAt?: Date;
      sharedWith?: string[];
      message?: string;
    },
  ) {
    const file = await this.findOne(fileId);
    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }

    const shareToken = this.generateShareToken();

    return this.prisma.fileShare.create({
      data: {
        ...data,
        fileId,
        shareToken,
      },
    });
  }

  async getFileByShareToken(shareToken: string) {
    const share = await this.prisma.fileShare.findUnique({
      where: { shareToken },
      include: {
        file: true,
        sharer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!share || !share.isActive) {
      throw new NotFoundException('Share not found or expired');
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      throw new BadRequestException('Share has expired');
    }

    if (share.maxDownloads && share.currentDownloads >= share.maxDownloads) {
      throw new BadRequestException('Maximum downloads reached');
    }

    return share;
  }

  async recordDownload(
    fileId: string,
    data: {
      shareId?: string;
      downloadedBy?: string;
      ipAddress: string;
      userAgent?: string;
      size: number;
    },
  ) {
    return this.prisma.fileDownload.create({
      data: {
        ...data,
        fileId,
        completed: true,
      },
    });
  }

  private generateShareToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
