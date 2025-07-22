import { AxiosInstance } from "axios";

// Types for messaging API
export interface MessagingMessage {
  id: string;
  senderId: string;
  content: string;
  messageType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM";
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  editedAt?: string;
  replyToId?: string;
  conversationId: string;
  attachments?: MessagingAttachment[];
  reactions?: MessagingReaction[];
  readReceipts?: MessagingReadReceipt[];
}

export interface MessagingAttachment {
  id: string;
  messageId: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface MessagingReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface MessagingReadReceipt {
  id: string;
  messageId: string;
  userId: string;
  readAt: string;
}

export interface MessagingConversation {
  id: string;
  type: "DIRECT" | "GROUP" | "SESSION" | "SUPPORT";
  title?: string;
  description?: string;
  avatarUrl?: string;
  isArchived: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
  participants: MessagingParticipant[];
  lastMessage?: MessagingMessage;
  unreadCount?: number;
}

export interface MessagingParticipant {
  id: string;
  conversationId: string;
  userId: string;
  role: "MEMBER" | "MODERATOR" | "ADMIN";
  joinedAt: string;
  leftAt?: string;
  isMuted: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface MessagingTypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface CreateConversationDto {
  participantIds: string[];
  type?: "DIRECT" | "GROUP";
  title?: string;
  description?: string;
}

export interface SendMessageDto {
  content: string;
  messageType?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO";
  replyToId?: string;
  attachments?: {
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }[];
}

export interface SearchMessagesParams {
  query: string;
  conversationId?: string;
  limit?: number;
  offset?: number;
}

export interface GetConversationsParams {
  limit?: number;
  offset?: number;
  includeArchived?: boolean;
}

export interface GetMessagesParams {
  limit?: number;
  offset?: number;
  before?: string; // message ID
  after?: string; // message ID
}

export interface UpdateMessageDto {
  content: string;
}

export interface BlockUserDto {
  userId: string;
  reason?: string;
}

/**
 * Messaging service for real-time messaging functionality
 * Handles conversations, messages, reactions, read receipts, and user blocking
 */
export function createMessagingService(axios: AxiosInstance) {
  return {
    // Conversation Management
    async getConversations(params?: GetConversationsParams) {
      const { data } = await axios.get<MessagingConversation[]>(
        "/messaging/conversations",
        { params }
      );
      return data;
    },

    async createConversation(conversationData: CreateConversationDto) {
      const { data } = await axios.post<MessagingConversation>(
        "/messaging/conversations",
        conversationData
      );
      return data;
    },

    /**
     * Start a direct conversation with another user
     * Finds existing direct conversation or creates a new one
     * @param targetUserId - The user ID to start conversation with
     * @returns Promise<MessagingConversation> - The conversation (existing or newly created)
     */
    async startDirectConversation(targetUserId: string) {
      // First, try to find existing direct conversation
      const conversations = await this.getConversations();

      const existingDirectConversation = conversations.find(
        (conv) =>
          conv.type === "DIRECT" &&
          conv.participants.some((p) => p.userId === targetUserId)
      );

      if (existingDirectConversation) {
        return existingDirectConversation;
      }

      // If no existing conversation, create a new direct conversation
      const newConversation = await this.createConversation({
        participantIds: [targetUserId],
        type: "DIRECT",
      });

      return newConversation;
    },

    async getConversation(conversationId: string) {
      const { data } = await axios.get<MessagingConversation>(
        `/messaging/conversations/${conversationId}`
      );
      return data;
    },

    async archiveConversation(conversationId: string) {
      const { data } = await axios.patch(
        `/messaging/conversations/${conversationId}/archive`
      );
      return data;
    },

    async unarchiveConversation(conversationId: string) {
      const { data } = await axios.patch(
        `/messaging/conversations/${conversationId}/unarchive`
      );
      return data;
    },

    async muteConversation(conversationId: string) {
      const { data } = await axios.patch(
        `/messaging/conversations/${conversationId}/mute`
      );
      return data;
    },

    async unmuteConversation(conversationId: string) {
      const { data } = await axios.patch(
        `/messaging/conversations/${conversationId}/unmute`
      );
      return data;
    },

    // Message Management
    async getMessages(conversationId: string, params?: GetMessagesParams) {
      const { data } = await axios.get<MessagingMessage[]>(
        `/messaging/conversations/${conversationId}/messages`,
        { params }
      );
      return data;
    },

    async sendMessage(conversationId: string, messageData: SendMessageDto) {
      const { data } = await axios.post<MessagingMessage>(
        `/messaging/conversations/${conversationId}/messages`,
        messageData
      );
      return data;
    },

    async updateMessage(messageId: string, messageData: UpdateMessageDto) {
      const { data } = await axios.put<MessagingMessage>(
        `/messaging/messages/${messageId}`,
        messageData
      );
      return data;
    },

    async deleteMessage(messageId: string) {
      const { data } = await axios.delete(`/messaging/messages/${messageId}`);
      return data;
    },

    // Read Receipts
    async markMessageAsRead(messageId: string) {
      const { data } = await axios.post(
        `/messaging/messages/${messageId}/read`
      );
      return data;
    },

    async markConversationAsRead(conversationId: string) {
      const { data } = await axios.post(
        `/messaging/conversations/${conversationId}/read`
      );
      return data;
    },

    // Reactions
    async addReaction(messageId: string, emoji: string) {
      const { data } = await axios.post(
        `/messaging/messages/${messageId}/reactions`,
        { emoji }
      );
      return data;
    },

    async removeReaction(messageId: string, emoji: string) {
      const { data } = await axios.delete(
        `/messaging/messages/${messageId}/reactions/${emoji}`
      );
      return data;
    },

    // Search
    async searchMessages(params: SearchMessagesParams) {
      const { data } = await axios.get<MessagingMessage[]>(
        "/messaging/search",
        { params }
      );
      return data;
    },

    // User Blocking
    async blockUser(blockData: BlockUserDto) {
      const { data } = await axios.post("/messaging/block", blockData);
      return data;
    },

    async unblockUser(blockId: string) {
      const { data } = await axios.delete(`/messaging/block/${blockId}`);
      return data;
    },

    async getBlockedUsers() {
      const { data } = await axios.get("/messaging/blocked");
      return data;
    },

    // Typing Indicators (for WebSocket integration)
    async sendTypingIndicator(conversationId: string, isTyping: boolean) {
      // This will be handled via WebSocket, but we provide REST fallback
      const { data } = await axios.post(
        `/messaging/conversations/${conversationId}/typing`,
        { isTyping }
      );
      return data;
    },

    // File Upload Support
    async uploadMessageFile(file: File): Promise<{
      url: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
    }> {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post("/messaging/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        url: data.url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      };
    },

    // Advanced Features
    async forwardMessage(messageId: string, conversationIds: string[]) {
      const { data } = await axios.post(
        `/messaging/messages/${messageId}/forward`,
        { conversationIds }
      );
      return data;
    },

    async reportMessage(messageId: string, reason: string) {
      const { data } = await axios.post(
        `/messaging/messages/${messageId}/report`,
        { reason }
      );
      return data;
    },

    // Conversation Participants
    async addParticipants(conversationId: string, userIds: string[]) {
      const { data } = await axios.post(
        `/messaging/conversations/${conversationId}/participants`,
        { userIds }
      );
      return data;
    },

    async removeParticipant(conversationId: string, userId: string) {
      const { data } = await axios.delete(
        `/messaging/conversations/${conversationId}/participants/${userId}`
      );
      return data;
    },

    async updateParticipantRole(
      conversationId: string,
      userId: string,
      role: "MEMBER" | "MODERATOR" | "ADMIN"
    ) {
      const { data } = await axios.patch(
        `/messaging/conversations/${conversationId}/participants/${userId}`,
        { role }
      );
      return data;
    },

    // Message Analytics (for therapist-client sessions)
    async getConversationAnalytics(conversationId: string) {
      const { data } = await axios.get(
        `/messaging/conversations/${conversationId}/analytics`
      );
      return data;
    },

    // Conversation Settings
    async updateConversationSettings(
      conversationId: string,
      settings: {
        title?: string;
        description?: string;
        avatarUrl?: string;
      }
    ) {
      const { data } = await axios.patch(
        `/messaging/conversations/${conversationId}/settings`,
        settings
      );
      return data;
    },
  };
}

export type MessagingService = ReturnType<typeof createMessagingService>;
