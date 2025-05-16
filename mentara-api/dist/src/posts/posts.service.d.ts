import { PrismaService } from 'src/providers/prisma-client.provider';
import { Post, Prisma } from '@prisma/client';
export declare class PostsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Post[]>;
    findOne(id: string): Promise<Post | null>;
    create(data: Prisma.PostCreateInput): Promise<Post>;
    update(id: string, data: Prisma.PostUpdateInput): Promise<Post>;
    remove(id: string): Promise<Post>;
    findByUserId(userId: string): Promise<Post[]>;
    findByCommunityId(communityId: string): Promise<Post[]>;
}
