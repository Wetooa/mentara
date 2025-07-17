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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  SupabaseStorageService,
  FileUploadResult,
} from '../common/services/supabase-storage.service';
import {
  CreateConversationDto,
  SendMessageDto,
  UpdateMessageDto,
  AddReactionDto,
  BlockUserDto,
  SearchMessagesDto,
  ConversationListParams,
} from 'mentara-commons';

@ApiTags('messaging')
@ApiBearerAuth('JWT-auth')
@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  // Conversation endpoints
  @Post('conversations')

  @ApiOperation({ 

    summary: 'Create create conversation',

    description: 'Create create conversation' 

  })

  @ApiResponse({ 

    status: 201, 

    description: 'Created successfully' 

  })

  @ApiResponse({ status: 401, description: 'Unauthorized' })

  
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


  @ApiOperation({ 


    summary: 'Retrieve get user conversations',


    description: 'Retrieve get user conversations' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  async getUserConversations(
    @CurrentUserId() userId: string,
    @Query() params: ConversationListParams,
  ) {
    return this.messagingService.getUserConversations(
      userId,
      params.page || 1,
      params.limit || 20,
    );
  }

  @Get('conversations/:conversationId/messages')


  @ApiOperation({ 


    summary: 'Retrieve get conversation messages',


    description: 'Retrieve get conversation messages' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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

  @ApiOperation({ 

    summary: 'Create send message',

    description: 'Create send message' 

  })

  @ApiResponse({ 

    status: 201, 

    description: 'Created successfully' 

  })

  @ApiResponse({ status: 401, description: 'Unauthorized' })

  
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


  @ApiOperation({ 


    summary: 'Update update message',


    description: 'Update update message' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Updated successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Delete delete message',


    description: 'Delete delete message' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Deleted successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @CurrentUserId() userId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.messagingService.deleteMessage(userId, messageId);
  }

  // Read receipts
  @Post('messages/:messageId/read')

  @ApiOperation({ 

    summary: 'Create mark message as read',

    description: 'Create mark message as read' 

  })

  @ApiResponse({ 

    status: 201, 

    description: 'Created successfully' 

  })

  @ApiResponse({ status: 401, description: 'Unauthorized' })

  
  @HttpCode(HttpStatus.OK)
  async markMessageAsRead(
    @CurrentUserId() userId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.messagingService.markMessageAsRead(userId, messageId);
  }

  // Message reactions
  @Post('messages/:messageId/reactions')

  @ApiOperation({ 

    summary: 'Create add message reaction',

    description: 'Create add message reaction' 

  })

  @ApiResponse({ 

    status: 201, 

    description: 'Created successfully' 

  })

  @ApiResponse({ status: 401, description: 'Unauthorized' })

  
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


  @ApiOperation({ 


    summary: 'Delete remove message reaction',


    description: 'Delete remove message reaction' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Deleted successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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

  @ApiOperation({ 

    summary: 'Create block user',

    description: 'Create block user' 

  })

  @ApiResponse({ 

    status: 201, 

    description: 'Created successfully' 

  })

  @ApiResponse({ status: 401, description: 'Unauthorized' })

  
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


  @ApiOperation({ 


    summary: 'Delete unblock user',


    description: 'Delete unblock user' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Deleted successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  @HttpCode(HttpStatus.NO_CONTENT)
  async unblockUser(
    @CurrentUserId() userId: string,
    @Param('blockedUserId') blockedUserId: string,
  ) {
    return this.messagingService.unblockUser(userId, blockedUserId);
  }

  // Search messages
  @Get('search')

  @ApiOperation({ 

    summary: 'Retrieve search messages',

    description: 'Retrieve search messages' 

  })

  @ApiResponse({ 

    status: 200, 

    description: 'Retrieved successfully' 

  })

  @ApiResponse({ status: 401, description: 'Unauthorized' })

  
  async searchMessages(
    @CurrentUserId() userId: string,
    @Query() searchDto: SearchMessagesDto,
  ) {
    const { query, conversationId, page, limit } = searchDto;
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 20;
    return this.messagingService.searchMessages(
      userId,
      query,
      conversationId,
      pageNum,
      limitNum,
    );
  }
}
