import { CommunitiesService } from './communities.service';
import { Community, Prisma } from '@prisma/client';
export declare class CommunitiesController {
    private readonly communitiesService;
    constructor(communitiesService: CommunitiesService);
    findAll(): Promise<Community[]>;
    findOne(id: string): Promise<Community>;
    create(communityData: Prisma.CommunityCreateInput): Promise<Community>;
    update(id: string, communityData: Prisma.CommunityUpdateInput): Promise<Community>;
    remove(id: string): Promise<Community>;
    findByUserId(userId: string): Promise<Community[]>;
}
