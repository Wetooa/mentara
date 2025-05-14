import { User } from '@clerk/backend';
import { PrismaService } from 'src/providers/prisma-client.provider';
export declare class AuthService {
    checkAdmin(currentUser: User, prisma: PrismaService): Promise<{
        success: boolean;
        admin: {
            id: string;
            role: string;
            permissions: string[];
        };
    }>;
    getUsers(): Promise<import("@clerk/backend/dist/api/resources/Deserializer").PaginatedResourceResponse<User[]>>;
}
