import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getMe(userId: string): Promise<import("@clerk/backend").User>;
    getAllUsers(): Promise<import("@clerk/backend/dist/api/resources/Deserializer").PaginatedResourceResponse<import("@clerk/backend").User[]>>;
    checkAdmin(userId: string): Promise<{
        success: boolean;
        admin: {
            id: string;
            role: string;
            permissions: string[];
        };
    }>;
}
