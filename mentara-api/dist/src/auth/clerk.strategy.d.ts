import { User } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { ClerkClient } from '@clerk/backend';
declare const ClerkStrategy_base: new () => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class ClerkStrategy extends ClerkStrategy_base {
    private readonly clerkClient;
    private readonly configService;
    constructor(clerkClient: ClerkClient, configService: ConfigService);
    validate(req: Request): Promise<User>;
}
export {};
