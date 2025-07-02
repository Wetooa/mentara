import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import {
  CreateConversationDto,
  SendMessageDto,
  UpdateMessageDto,
  AddReactionDto,
  BlockUserDto,
  SearchMessagesDto,
} from './dto/messaging.dto';

@Controller('messaging')
@UseGuards(ClerkAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

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
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.messagingService.getUserConversations(
      userId,
      pageNum,
      limitNum,
    );
  }

  @Get('conversations/:conversationId/messages')
  async getConversationMessages(
    @CurrentUserId() userId: string,
    @Param('conversationId') conversationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 50;
    return this.messagingService.getConversationMessages(
      userId,
      conversationId,
      pageNum,
      limitNum,
    );
  }

  // Message endpoints
  @Post('conversations/:conversationId/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentUserId() userId: string,
    @Param('conversationId') conversationId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(
      userId,
      conversationId,
      sendMessageDto,
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
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.messagingService.searchMessages(
      userId,
      query,
      conversationId,
      pageNum,
      limitNum,
    );
  }
}
