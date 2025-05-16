import { PrismaService } from 'src/providers/prisma-client.provider';
import { TherapistApplication, Prisma } from '@prisma/client';
export declare class TherapistApplicationService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(params: {
        status?: string;
        skip?: number;
        take?: number;
    }): Promise<{
        applications: TherapistApplication[];
        total: number;
    }>;
    findOne(id: string): Promise<TherapistApplication | null>;
    create(data: Prisma.TherapistApplicationCreateInput): Promise<TherapistApplication>;
    update(id: string, data: Prisma.TherapistApplicationUpdateInput): Promise<TherapistApplication>;
    remove(id: string): Promise<TherapistApplication>;
    isUserAdmin(clerkUserId: string): Promise<boolean>;
}
