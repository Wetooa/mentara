import { TherapistApplicationService } from './therapist-application.service';
import { TherapistApplication, Prisma } from '@prisma/client';
import { User } from '@clerk/backend';
export declare class TherapistApplicationController {
    private readonly therapistApplicationService;
    constructor(therapistApplicationService: TherapistApplicationService);
    findAll(user: User, status?: string, limit?: string, offset?: string): Promise<{
        applications: TherapistApplication[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    findOne(id: string): Promise<TherapistApplication>;
    create(user: User, applicationData: any): Promise<{
        success: boolean;
        message: string;
        applicationId: string;
    }>;
    update(id: string, applicationData: Prisma.TherapistApplicationUpdateInput): Promise<TherapistApplication>;
    remove(id: string): Promise<TherapistApplication>;
}
