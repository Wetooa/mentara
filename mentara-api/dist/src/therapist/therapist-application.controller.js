"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TherapistApplicationController = void 0;
const common_1 = require("@nestjs/common");
const therapist_application_service_1 = require("./therapist-application.service");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("src/decorators/current-user.decorator");
let TherapistApplicationController = class TherapistApplicationController {
    therapistApplicationService;
    constructor(therapistApplicationService) {
        this.therapistApplicationService = therapistApplicationService;
    }
    async findAll(user, status, limit, offset) {
        try {
            if (!user ||
                !user.id ||
                !(await this.therapistApplicationService.isUserAdmin(user.id))) {
                throw new common_1.ForbiddenException('Unauthorized: Admin access required');
            }
            const take = limit ? parseInt(limit) : 100;
            const skip = offset ? parseInt(offset) : 0;
            const { applications, total } = await this.therapistApplicationService.findAll({
                status,
                skip,
                take,
            });
            return {
                applications,
                pagination: {
                    total,
                    limit: take,
                    offset: skip,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to fetch applications: ${error.message}`, error instanceof common_1.ForbiddenException
                ? common_1.HttpStatus.FORBIDDEN
                : common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const application = await this.therapistApplicationService.findOne(id);
            if (!application) {
                throw new common_1.HttpException('Application not found', common_1.HttpStatus.NOT_FOUND);
            }
            return application;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to fetch application: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async create(user, applicationData) {
        try {
            if (!applicationData.firstName ||
                !applicationData.lastName ||
                !applicationData.email) {
                throw new common_1.HttpException('Missing required fields', common_1.HttpStatus.BAD_REQUEST);
            }
            const sanitizedData = {
                clerkUserId: user?.id || null,
                status: 'pending',
                firstName: String(applicationData.firstName || ''),
                lastName: String(applicationData.lastName || ''),
                email: String(applicationData.email || ''),
                mobile: String(applicationData.mobile || ''),
                province: String(applicationData.province || ''),
                providerType: String(applicationData.providerType || ''),
                professionalLicenseType: String(applicationData.professionalLicenseType || ''),
                isPRCLicensed: String(applicationData.isPRCLicensed || 'no'),
                prcLicenseNumber: String(applicationData.prcLicenseNumber || ''),
                expirationDateOfLicense: applicationData.expirationDateOfLicense
                    ? new Date(applicationData.expirationDateOfLicense)
                    : null,
                isLicenseActive: String(applicationData.isLicenseActive || 'no'),
                yearsOfExperience: String(applicationData.yearsOfExperience || ''),
                areasOfExpertise: applicationData.areasOfExpertise || {},
                assessmentTools: applicationData.assessmentTools || {},
                therapeuticApproachesUsedList: applicationData.therapeuticApproachesUsedList || {},
                languagesOffered: applicationData.languagesOffered || {},
                providedOnlineTherapyBefore: String(applicationData.providedOnlineTherapyBefore || 'no'),
                comfortableUsingVideoConferencing: String(applicationData.comfortableUsingVideoConferencing || 'no'),
                weeklyAvailability: String(applicationData.weeklyAvailability || ''),
                preferredSessionLength: String(applicationData.preferredSessionLength || ''),
                accepts: applicationData.accepts || {},
                privateConfidentialSpace: String(applicationData.privateConfidentialSpace || 'no'),
                compliesWithDataPrivacyAct: String(applicationData.compliesWithDataPrivacyAct || 'no'),
                professionalLiabilityInsurance: String(applicationData.professionalLiabilityInsurance || 'no'),
                complaintsOrDisciplinaryActions: String(applicationData.complaintsOrDisciplinaryActions || 'no'),
                willingToAbideByPlatformGuidelines: String(applicationData.willingToAbideByPlatformGuidelines || 'no'),
                uploadedDocuments: applicationData.uploadedDocuments || {},
                applicationData: applicationData,
            };
            const application = await this.therapistApplicationService.create(sanitizedData);
            return {
                success: true,
                message: 'Application submitted successfully',
                applicationId: application.id,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to submit application: ${error.message}`, error instanceof common_1.HttpException
                ? error.getStatus()
                : common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, applicationData) {
        try {
            return await this.therapistApplicationService.update(id, applicationData);
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to update application: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id) {
        try {
            return await this.therapistApplicationService.remove(id);
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to delete application: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.TherapistApplicationController = TherapistApplicationController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, String, String, String]),
    __metadata("design:returntype", Promise)
], TherapistApplicationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TherapistApplicationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Object]),
    __metadata("design:returntype", Promise)
], TherapistApplicationController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TherapistApplicationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TherapistApplicationController.prototype, "remove", null);
exports.TherapistApplicationController = TherapistApplicationController = __decorate([
    (0, common_1.Controller)('therapist/application'),
    __metadata("design:paramtypes", [therapist_application_service_1.TherapistApplicationService])
], TherapistApplicationController);
//# sourceMappingURL=therapist-application.controller.js.map