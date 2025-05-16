"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkClientProvider = void 0;
const backend_1 = require("@clerk/backend");
const config_1 = require("@nestjs/config");
exports.ClerkClientProvider = {
    provide: 'ClerkClient',
    useFactory: (configService) => {
        return (0, backend_1.createClerkClient)({
            publishableKey: configService.get('CLERK_PUBLISHABLE_KEY'),
            secretKey: configService.get('CLERK_SECRET_KEY'),
        });
    },
    inject: [config_1.ConfigService],
};
//# sourceMappingURL=clerk-client.provider.js.map