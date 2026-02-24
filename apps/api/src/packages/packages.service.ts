import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { CreatePackageDto } from './types/packages.dto';

@Injectable()
export class PackagesService {
  private readonly logger = new Logger(PackagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createPackage(therapistId: string, data: CreatePackageDto) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId: therapistId }
    });
    if (!therapist || therapist.status !== 'APPROVED') {
      throw new ForbiddenException('Only approved therapists can create packages');
    }

    return this.prisma.therapist_Packages.create({
      data: {
        therapistId,
        title: data.title,
        description: data.description,
        sessionCount: data.sessionCount,
        price: data.price,
        validityDays: data.validityDays,
        features: data.features ?? [],
        status: 'PENDING_APPROVAL',
      }
    });
  }

  async getTherapistPackages(therapistId: string) {
    return this.prisma.therapist_Packages.findMany({
      where: { therapistId },
      orderBy: { price: 'asc' }
    });
  }

  async getPendingPackages() {
    return this.prisma.therapist_Packages.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        therapist: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } }
          }
        }
      }
    });
  }

  async approvePackage(packageId: string) {
    return this.prisma.therapist_Packages.update({
      where: { packageId },
      data: { status: 'APPROVED' }
    });
  }

  async rejectPackage(packageId: string) {
    return this.prisma.therapist_Packages.update({
      where: { packageId },
      data: { status: 'REJECTED' }
    });
  }
}
