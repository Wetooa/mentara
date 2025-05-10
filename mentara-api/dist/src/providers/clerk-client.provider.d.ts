import { ConfigService } from '@nestjs/config';
export declare const ClerkClientProvider: {
    provide: string;
    useFactory: (configService: ConfigService) => import("@clerk/backend").ClerkClient;
    inject: (typeof ConfigService)[];
};
