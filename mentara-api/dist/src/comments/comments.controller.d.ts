import { CommentsService } from './comments.service';
import { Comment, Prisma } from '@prisma/client';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    findAll(): Promise<Comment[]>;
    findOne(id: string): Promise<Comment>;
    create(commentData: Prisma.CommentCreateInput): Promise<Comment>;
    update(id: string, commentData: Prisma.CommentUpdateInput): Promise<Comment>;
    remove(id: string): Promise<Comment>;
}
