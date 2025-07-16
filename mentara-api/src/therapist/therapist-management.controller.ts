import { Controller, UseGuards } from '@nestjs/common';
import { TherapistManagementService } from './therapist-management.service';
import { WorksheetsService } from '../worksheets/worksheets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('therapist-management')
@UseGuards(JwtAuthGuard)
export class TherapistManagementController {
  constructor(
    private readonly therapistManagementService: TherapistManagementService,
    private readonly worksheetsService: WorksheetsService,
  ) {}

  // Note: Profile, client, and worksheet management routes have been moved to dedicated controllers:
  // - TherapistProfileController handles profile operations
  // - TherapistClientController handles client management
  // - TherapistWorksheetController handles worksheet operations
  // This controller can be deprecated or used for other general therapist management operations
}
