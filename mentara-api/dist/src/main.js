"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const bodyParser = require("body-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
    });
    app.use(bodyParser.json({
        verify: (req, res, buf) => {
            req.rawBody = buf;
        },
    }));
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
    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT || 5000);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map