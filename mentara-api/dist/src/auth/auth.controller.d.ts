import { AuthService } from './auth.service';
import { User } from '@clerk/backend';
import { PrismaService } from 'src/providers/prisma-client.provider';
export declare class AuthController {
    private readonly authService;
    private readonly prismaService;
    constructor(authService: AuthService, prismaService: PrismaService);
    checkAdmin(user: User): Promise<{
        success: boolean;
        admin: {
            id: string;
            role: string;
            permissions: string[];
        };
    }>;
}
