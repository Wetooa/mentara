export declare class AuthService {
    getUsers(): Promise<import("@clerk/backend/dist/api/resources/Deserializer").PaginatedResourceResponse<import("@clerk/clerk-sdk-node").User[]>>;
    getUser(userId: string): Promise<import("@clerk/clerk-sdk-node").User>;
    checkAdmin(userId: string): Promise<{
        success: boolean;
        admin: {
            id: string;
            role: string;
            permissions: string[];
        };
    }>;
}
