import { ConfigService } from '@nestjs/config';
export declare const ClerkClientProvider: {
    provide: string;
    useFactory: (configService: ConfigService) => any;
    inject: (typeof ConfigService)[];
};
