import { PrismaService } from 'src/providers/prisma-client.provider';
import { Comment, Prisma } from '@prisma/client';
export declare class CommentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Comment[]>;
    findOne(id: string): Promise<Comment | null>;
    create(data: Prisma.CommentCreateInput): Promise<Comment>;
    update(id: string, data: Prisma.CommentUpdateInput): Promise<Comment>;
    remove(id: string): Promise<Comment>;
}
