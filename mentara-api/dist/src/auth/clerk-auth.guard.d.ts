import { type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
declare const ClerkAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class ClerkAuthGuard extends ClerkAuthGuard_base {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
}
export {};
