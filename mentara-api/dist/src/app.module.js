"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./users/users.module");
const communities_module_1 = require("./communities/communities.module");
const posts_module_1 = require("./posts/posts.module");
const comments_module_1 = require("./comments/comments.module");
const therapist_module_1 = require("./therapist/therapist.module");
const worksheets_module_1 = require("./worksheets/worksheets.module");
const pre_assessment_module_1 = require("./pre-assessment/pre-assessment.module");
const booking_module_1 = require("./booking/booking.module");
const reviews_module_1 = require("./reviews/reviews.module");
const admin_module_1 = require("./admin/admin.module");
const moderator_module_1 = require("./moderator/moderator.module");
const client_module_1 = require("./client/client.module");
const messaging_module_1 = require("./messaging/messaging.module");
const prisma_client_provider_1 = require("./providers/prisma-client.provider");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            communities_module_1.CommunitiesModule,
            posts_module_1.PostsModule,
            comments_module_1.CommentsModule,
            therapist_module_1.TherapistModule,
            worksheets_module_1.WorksheetsModule,
            pre_assessment_module_1.PreAssessmentModule,
            booking_module_1.BookingModule,
            reviews_module_1.ReviewsModule,
            admin_module_1.AdminModule,
            moderator_module_1.ModeratorModule,
            client_module_1.ClientModule,
            messaging_module_1.MessagingModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            prisma_client_provider_1.PrismaService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map