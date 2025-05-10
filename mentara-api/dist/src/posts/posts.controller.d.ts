import { PostsService } from './posts.service';
import { Post as PostEntity, Prisma } from '@prisma/client';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    findAll(): Promise<PostEntity[]>;
    findOne(id: string): Promise<PostEntity>;
    create(postData: Prisma.PostCreateInput): Promise<PostEntity>;
    update(id: string, postData: Prisma.PostUpdateInput): Promise<PostEntity>;
    remove(id: string): Promise<PostEntity>;
    findByUserId(userId: string): Promise<PostEntity[]>;
    findByCommunityId(communityId: string): Promise<PostEntity[]>;
}
