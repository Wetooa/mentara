import { User } from '@clerk/backend';
export declare class AuthService {
    checkAdmin(currentUser: User): Promise<{
        success: boolean;
        admin: {
            id: string;
            role: string;
            permissions: string[];
        };
    }>;
    getUsers(): Promise<import("@clerk/backend/dist/api/resources/Deserializer").PaginatedResourceResponse<User[]>>;
}
