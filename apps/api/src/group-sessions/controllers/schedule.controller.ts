import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/core/guards/jwt-auth.guard';
import { GetUser } from '../../decorators/get-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ScheduleService } from '../services/schedule.service';
import { AvailabilityCheckService } from '../services/availability-check.service';
import { GetScheduleDto, GetScheduleDtoSchema } from '../dto/get-schedule.dto';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  private readonly logger = new Logger(ScheduleController.name);

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly availabilityCheck: AvailabilityCheckService,
  ) {}

  /**
   * Get user's unified schedule (one-on-one + group sessions)
   */
  @Get()
  async getSchedule(
    @GetUser('id') userId: string,
    @Query(new ZodValidationPipe(GetScheduleDtoSchema)) query: GetScheduleDto,
  ) {
    const events = await this.scheduleService.getUserSchedule(userId, {
      startDate: query.startDate,
      endDate: query.endDate,
      includeCompleted: query.includeCompleted,
    });

    return {
      events,
      total: events.length,
    };
  }

  /**
   * Check for conflicts at a specific time
   */
  @Get('conflicts')
  async checkConflicts(
    @GetUser('id') userId: string,
    @Query('scheduledAt') scheduledAt: string,
    @Query('duration') duration: string,
  ) {
    const scheduled = new Date(scheduledAt);
    const durationNum = parseInt(duration);

    const hasConflict = await this.availabilityCheck.checkAvailability(
      userId,
      scheduled,
      durationNum,
    );

    if (hasConflict) {
      const conflicts = await this.availabilityCheck.getConflictingEvents(
        userId,
        scheduled,
        durationNum,
      );

      return {
        hasConflict: true,
        conflicts,
      };
    }

    return {
      hasConflict: false,
      message: 'No conflicts found',
    };
  }
}
