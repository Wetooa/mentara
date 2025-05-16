"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TherapistModule = void 0;
const common_1 = require("@nestjs/common");
const therapist_application_controller_1 = require("./therapist-application.controller");
const therapist_application_service_1 = require("./therapist-application.service");
const prisma_client_provider_1 = require("../providers/prisma-client.provider");
let TherapistModule = class TherapistModule {
};
exports.TherapistModule = TherapistModule;
exports.TherapistModule = TherapistModule = __decorate([
    (0, common_1.Module)({
        controllers: [therapist_application_controller_1.TherapistApplicationController],
        providers: [therapist_application_service_1.TherapistApplicationService, prisma_client_provider_1.PrismaService],
        exports: [therapist_application_service_1.TherapistApplicationService],
    })
], TherapistModule);
//# sourceMappingURL=therapist.module.js.map