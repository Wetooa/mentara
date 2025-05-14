import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    checkIsSignedIn(): Promise<void>;
    getAllUsers(): Promise<import("@clerk/backend/dist/api/resources/Deserializer").PaginatedResourceResponse<import("@clerk/backend").User[]>>;
    checkAdmin(): boolean;
}
