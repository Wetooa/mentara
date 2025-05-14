import { CanActivate, ExecutionContext } from '@nestjs/common';
declare module 'express' {
    interface Request {
        userId: string;
    }
}
export declare class ClerkAuthGuard implements CanActivate {
    private readonly logger;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
