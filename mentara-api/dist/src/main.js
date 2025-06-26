"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const fs = require("fs");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
    });
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'https://localhost:3000',
            'http://localhost:4000',
            'https://localhost:4000',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
        allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, svix-id, svix-signature, svix-timestamp',
    });
    const uploadsDir = (0, path_1.join)(__dirname, '..', 'uploads');
    const worksheetsDir = (0, path_1.join)(uploadsDir, 'worksheets');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }
    if (!fs.existsSync(worksheetsDir)) {
        fs.mkdirSync(worksheetsDir);
    }
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT ?? 5000);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map