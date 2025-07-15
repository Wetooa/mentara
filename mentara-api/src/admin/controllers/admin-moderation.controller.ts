import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  Query,
  HttpCode,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../guards/admin-auth.guard';
import { AdminOnly } from '../../decorators/admin-only.decorator';
import { CurrentUserId } from '../../decorators/current-user-id.decorator';
import { ModerationService, ModerationContext } from '../../common/services/moderation.service';

@Controller('admin/moderation')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
export class AdminModerationController {
  private readonly logger = new Logger(AdminModerationController.name);

  constructor(
    private readonly adminService: AdminService,
    private readonly moderationService: ModerationService,
  ) {}

  @Get('flagged')
  @AdminOnly()
  async getFlaggedContent(
    @CurrentUserId() currentUserId: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      this.logger.log(`Admin ${currentUserId} retrieving flagged content`);
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;

      return await this.adminService.getFlaggedContent({
        type,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      this.logger.error('Failed to retrieve flagged content:', error);
      throw new HttpException(
        'Failed to retrieve flagged content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':contentType/:contentId/moderate')
  @AdminOnly()
  async moderateContent(
    @CurrentUserId() currentUserId: string,
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
    @Body()
    moderationData: { action: 'approve' | 'remove' | 'flag'; reason?: string },
  ) {
    try {
      this.logger.log(
        `Admin ${currentUserId} moderating ${contentType} ${contentId}`,
      );
      return await this.adminService.moderateContent(
        contentType,
        contentId,
        currentUserId,
        moderationData.action,
        moderationData.reason,
      );
    } catch (error) {
      this.logger.error('Failed to moderate content:', error);
      throw new HttpException(
        'Failed to moderate content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // AI Moderation Service Integration

  /**
   * Get moderation service health status
   */
  @Get('service/health')
  @AdminOnly()
  async getServiceHealthStatus() {
    try {
      return await this.moderationService.healthCheck();
    } catch (error) {
      this.logger.error('Failed to get moderation service health:', error);
      throw new HttpException(
        'Failed to get moderation service health',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get moderation service statistics
   */
  @Get('service/stats')
  @AdminOnly()
  async getServiceStats() {
    try {
      return await this.moderationService.getStats();
    } catch (error) {
      this.logger.error('Failed to get moderation service stats:', error);
      throw new HttpException(
        'Failed to get moderation service stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Test content classification (for admin testing)
   */
  @Post('service/test-classify')
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  async testClassification(
    @CurrentUserId() adminId: string,
    @Body() body: { text: string; context: string },
  ) {
    try {
      const context: ModerationContext = {
        context: body.context,
        userId: adminId,
        userRole: 'admin',
        timestamp: new Date(),
      };

      const result = await this.moderationService.classifyContent(body.text, context);
      
      return {
        result,
        testInfo: {
          testedBy: adminId,
          timestamp: new Date(),
          inputText: body.text,
          inputContext: body.context,
        },
      };
    } catch (error) {
      this.logger.error('Failed to test content classification:', error);
      throw new HttpException(
        'Failed to test content classification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Check if content would trigger crisis intervention
   */
  @Post('service/test-crisis')
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  async testCrisisDetection(
    @CurrentUserId() adminId: string,
    @Body() body: { text: string; context: string },
  ) {
    try {
      const context: ModerationContext = {
        context: body.context,
        userId: adminId,
        userRole: 'admin',
        timestamp: new Date(),
      };

      const isCrisis = await this.moderationService.checkCrisisContent(body.text, context);
      const fullResult = await this.moderationService.classifyContent(body.text, context);
      
      return {
        isCrisis,
        crisisLevel: fullResult.crisisLevel,
        immediateEscalation: fullResult.immediateEscalation,
        fullResult,
        testInfo: {
          testedBy: adminId,
          timestamp: new Date(),
          inputText: body.text,
          inputContext: body.context,
        },
      };
    } catch (error) {
      this.logger.error('Failed to test crisis detection:', error);
      throw new HttpException(
        'Failed to test crisis detection',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Batch test multiple content items
   */
  @Post('service/test-batch')
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  async testBatchClassification(
    @CurrentUserId() adminId: string,
    @Body() body: { items: Array<{ text: string; context: string }> },
  ) {
    try {
      const items = body.items.map(item => ({
        text: item.text,
        context: {
          context: item.context,
          userId: adminId,
          userRole: 'admin' as const,
          timestamp: new Date(),
        },
      }));

      const results = await this.moderationService.batchClassify(items);
      
      return {
        results,
        testInfo: {
          testedBy: adminId,
          timestamp: new Date(),
          itemCount: items.length,
        },
      };
    } catch (error) {
      this.logger.error('Failed to test batch classification:', error);
      throw new HttpException(
        'Failed to test batch classification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
