import { PrismaService } from 'src/providers/prisma-client.provider';
import { Community, Prisma } from '@prisma/client';
export declare class CommunitiesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Community[]>;
    findOne(id: string): Promise<Community | null>;
    create(data: Prisma.CommunityCreateInput): Promise<Community>;
    update(id: string, data: Prisma.CommunityUpdateInput): Promise<Community>;
    remove(id: string): Promise<Community>;
    findByUserId(userId: string): Promise<Community[]>;
}
