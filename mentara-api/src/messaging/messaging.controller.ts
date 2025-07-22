import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import {
  SupabaseStorageService,
  FileUploadResult,
} from '../common/services/supabase-storage.service';
import type {
  CreateConversationDto,
  SendMessageDto,
  UpdateMessageDto,
  AddReactionDto,
  BlockUserDto,
  SearchMessagesDto,
  ConversationListParams,
} from './types';

@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  // Conversation endpoints
  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  async createConversation(
    @CurrentUserId() userId: string,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.messagingService.createConversation(
      userId,
      createConversationDto,
    );
  }

  @Get('conversations')
  async getUserConversations(
    @CurrentUserId() userId: string,
    @Query() params: ConversationListParams,
  ) {
    console.log(
      '🚀 [MESSAGING CONTROLLER] getUserConversations endpoint called',
    );
    console.log('👤 [USER ID]', userId);
    console.log('📊 [QUERY PARAMS]', params);

    try {
      const result = await this.messagingService.getUserConversations(
        userId,
        params.page || 1,
        params.limit || 20,
      );

      console.log(
        '✅ [CONTROLLER RESPONSE] Returning',
        result.length,
        'conversations',
      );
      console.log(
        '📝 [RESPONSE SUMMARY]:',
        result.map((conv) => ({
          id: conv.id,
          type: conv.type,
          title: conv.title,
          participantCount: conv.participants?.length || 0,
          messageCount: conv.messages?.length || 0,
        })),
      );

      return result;
    } catch (error) {
      console.error(
        '❌ [CONTROLLER ERROR] getUserConversations failed:',
        error,
      );
      throw error;
    }
  }

  @Get('recent-communications')
  async getRecentCommunications(
    @CurrentUserId() userId: string,
    @Query('limit') limit?: string,
  ) {
    console.log('📞 [MESSAGING CONTROLLER] getRecentCommunications endpoint called');
    console.log('👤 [USER ID]', userId);
    console.log('📊 [LIMIT]', limit);
    
    try {
      const limitNum = limit ? Number(limit) : 5;
      const result = await this.messagingService.getRecentCommunications(
        userId,
        limitNum,
      );
      
      console.log('✅ [CONTROLLER RESPONSE] Returning', result.length, 'recent communications');
      console.log('📱 [RESPONSE SUMMARY]:', result.map(comm => ({
        id: comm?.id,
        name: comm?.name,
        role: comm?.role,
        hasLastMessage: !!comm?.lastMessage,
        unreadCount: comm?.unreadCount
      })));
      
      return result;
    } catch (error) {
      console.error('❌ [CONTROLLER ERROR] getRecentCommunications failed:', error);
      throw error;
    }
  }

  @Get('conversations/:conversationId/messages')
  async getConversationMessages(
    @CurrentUserId() userId: string,
    @Param('conversationId') conversationId: string,
    @Query() params: ConversationListParams,
  ) {
    const pageNum = params.page || 1;
    const limitNum = params.limit || 50;
    return this.messagingService.getConversationMessages(
      userId,
      conversationId,
      pageNum,
      limitNum,
    );
  }

  // Message endpoints
  @Post('conversations/:conversationId/messages')
  @UseInterceptors(FilesInterceptor('files', 3)) // Support up to 3 files
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentUserId() userId: string,
    @Param('conversationId') conversationId: string,
    @Body() sendMessageDto: SendMessageDto,
    @UploadedFiles() files: Express.Multer.File[] = [], // Optional files
  ) {
    // Validate and upload files if provided
    const fileResults: FileUploadResult[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const validation = this.supabaseStorageService.validateFile(file);
        if (!validation.isValid) {
          throw new HttpException(
            `File validation failed: ${validation.error}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Upload files to Supabase
      const uploadResults = await this.supabaseStorageService.uploadFiles(
        files,
        SupabaseStorageService.getSupportedBuckets().MESSAGES,
      );
      fileResults.push(...uploadResults);
    }

    return this.messagingService.sendMessage(
      userId,
      conversationId,
      sendMessageDto,
      fileResults.map((f) => f.url),
      fileResults.map((f) => f.filename),
      files.map((f) => f.size),
    );
  }

  @Put('messages/:messageId')
  async updateMessage(
    @CurrentUserId() userId: string,
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messagingService.updateMessage(
      userId,
      messageId,
      updateMessageDto,
    );
  }

  @Delete('messages/:messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @CurrentUserId() userId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.messagingService.deleteMessage(userId, messageId);
  }

  // Read receipts
  @Post('messages/:messageId/read')
  @HttpCode(HttpStatus.OK)
  async markMessageAsRead(
    @CurrentUserId() userId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.messagingService.markMessageAsRead(userId, messageId);
  }

  // Message reactions
  @Post('messages/:messageId/reactions')
  @HttpCode(HttpStatus.CREATED)
  async addMessageReaction(
    @CurrentUserId() userId: string,
    @Param('messageId') messageId: string,
    @Body() addReactionDto: AddReactionDto,
  ) {
    return this.messagingService.addMessageReaction(
      userId,
      messageId,
      addReactionDto.emoji,
    );
  }

  @Delete('messages/:messageId/reactions/:emoji')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMessageReaction(
    @CurrentUserId() userId: string,
    @Param('messageId') messageId: string,
    @Param('emoji') emoji: string,
  ) {
    return this.messagingService.removeMessageReaction(
      userId,
      messageId,
      emoji,
    );
  }

  // User blocking
  @Post('block')
  @HttpCode(HttpStatus.CREATED)
  async blockUser(
    @CurrentUserId() userId: string,
    @Body() blockUserDto: BlockUserDto,
  ) {
    return this.messagingService.blockUser(
      userId,
      blockUserDto.userId,
      blockUserDto.reason,
    );
  }

  @Delete('block/:blockedUserId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unblockUser(
    @CurrentUserId() userId: string,
    @Param('blockedUserId') blockedUserId: string,
  ) {
    return this.messagingService.unblockUser(userId, blockedUserId);
  }

  // Search messages
  @Get('search')
  async searchMessages(
    @CurrentUserId() userId: string,
    @Query() searchDto: SearchMessagesDto,
  ) {
    const { query, conversationId, page, limit } = searchDto;
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 20;
    return this.messagingService.searchMessages(
      userId,
      query || '',
      conversationId,
      pageNum,
      limitNum,
    );
  }
}
