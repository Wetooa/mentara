import {
  Contact,
  Conversation,
  Message,
  MessageStatus,
} from "@/components/messages/types";
import { format } from "date-fns";
import { createAxiosClient, setTokenProvider } from './api/client';

// Helper function to determine message status
const getMessageStatus = (backendMessage: Record<string, unknown>, currentUserId: string): MessageStatus => {
  if (backendMessage.senderId !== currentUserId) {
    return "read"; // Other user's messages are always marked as read for display
  }

  // For own messages, check read receipts
  if (backendMessage.readReceipts && backendMessage.readReceipts.length > 0) {
    return "read";
  }

  // Simple logic for delivered vs sent (could be enhanced with WebSocket status)
  const messageAge = Date.now() - new Date(backendMessage.createdAt).getTime();
  return messageAge > 1000 ? "delivered" : "sent";
};

// Helper function to determine attachment type
const getAttachmentType = (
  url: string
): "image" | "document" | "audio" | "video" => {
  const extension = url.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
    return "image";
  } else if (["mp4", "avi", "mov", "wmv"].includes(extension || "")) {
    return "video";
  } else if (["mp3", "wav", "ogg", "m4a"].includes(extension || "")) {
    return "audio";
  }

  return "document";
};

// Enhanced conversion function for frontend format with proper time formatting
const convertBackendMessageToFrontendFormat = (backendMessage: Record<string, unknown>, currentUserId: string): Message => {
  return {
    id: backendMessage.id,
    sender: backendMessage.senderId === currentUserId ? "me" : "them",
    text: backendMessage.content,
    time: format(new Date(backendMessage.createdAt), "HH:mm"),
    status: getMessageStatus(backendMessage, currentUserId),
    attachments: backendMessage.attachmentUrl ? [{
      id: `attachment-${backendMessage.id}`,
      type: getAttachmentType(backendMessage.attachmentUrl),
      url: backendMessage.attachmentUrl,
      name: backendMessage.attachmentName || 'Attachment',
      size: backendMessage.attachmentSize,
    }] : undefined,
    reactions: backendMessage.reactions?.map((reaction: Record<string, unknown>) => ({
      emoji: reaction.emoji,
      count: 1,
      users: [reaction.user.id],
    })),
    replyTo: backendMessage.replyToId,
    isDeleted: backendMessage.isDeleted,
  };
};

// Enhanced conversion function for frontend format with proper time formatting
const convertBackendConversationToFrontendFormat = (
  backendConversation: Record<string, unknown>, 
  currentUserId: string
): { contact: Contact; conversation: Conversation } => {
  // Find the other participant (not the current user)
  const otherParticipant = backendConversation.participants.find(
    (p: Record<string, unknown>) => p.userId !== currentUserId
  );

  if (!otherParticipant) {
    throw new Error("No other participant found in conversation");
  }

  const lastMessage = backendConversation.messages?.[0];

  const contact: Contact = {
    id: backendConversation.id, // Use conversation ID as contact ID
    name: `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`,
    status: "offline", // Will be updated via WebSocket
    lastMessage: lastMessage?.content || "",
    time: lastMessage ? format(new Date(lastMessage.createdAt), "HH:mm") : "",
    unread: backendConversation._count?.messages || 0,
    avatar: otherParticipant.user.avatarUrl || "/avatar-placeholder.png",
    isTyping: false,
  };

  const conversation: Conversation = {
    id: backendConversation.id,
    contactId: backendConversation.id,
    messages: [], // Will be loaded separately
    lastReadMessageId: undefined, // Will be determined from read receipts
  };

  return { contact, conversation };
};

// Create authenticated messaging API service using axios
export const createMessagingApiService = (getToken: () => Promise<string | null>) => {
  // Set the token provider and create axios client
  setTokenProvider(getToken);
  const client = createAxiosClient();
  
  // Get current user ID cache
  let cachedUserId: string | null = null;
  let userIdPromise: Promise<string> | null = null;

  const getCurrentUserId = async (): Promise<string> => {
    // Return cached value if available
    if (cachedUserId) {
      return cachedUserId;
    }

    // Return existing promise if one is already in progress
    if (userIdPromise) {
      return userIdPromise;
    }

    userIdPromise = (async () => {
      try {
        const userInfo = await client.get('/auth/me');
        const userId = userInfo.data.id;
        if (!userId) {
          throw new Error("User ID not found in response");
        }
        cachedUserId = userId;
        return userId;
      } catch (error) {
        console.error("Error getting current user ID:", error);
        throw new Error("Failed to get current user ID");
      } finally {
        userIdPromise = null; // Clear the promise when done
      }
    })();

    return userIdPromise;
  };

  return {
    // Fetch all conversations for the current user
    async fetchContacts(): Promise<Contact[]> {
      try {
        const currentUserId = await getCurrentUserId();
        const conversations = await client.get('/messaging/conversations');
        
        return conversations.data.map((conv: Record<string, unknown>) => {
          const { contact } = convertBackendConversationToFrontendFormat(conv, currentUserId);
          return contact;
        });
      } catch (error) {
        console.error("Error fetching contacts:", error);
        return [];
      }
    },

    // Fetch messages for a specific conversation
    async fetchConversation(
      conversationId: string
    ): Promise<Conversation | undefined> {
      try {
        const currentUserId = await getCurrentUserId();
        const messages = await client.get(`/messaging/conversations/${conversationId}/messages`);
        
        const convertedMessages = messages.data.map((msg: Record<string, unknown>) => 
          convertBackendMessageToFrontendFormat(msg, currentUserId)
        );

        return {
          id: conversationId,
          contactId: conversationId,
          messages: convertedMessages,
          lastReadMessageId: undefined, // TODO: Implement based on read receipts
        };
      } catch (error) {
        console.error("Error fetching conversation:", error);
        return undefined;
      }
    },

    // Send a new message
    async sendMessage(
      conversationId: string,
      content: string,
      attachments?: { name: string; url: string; type: string }[]
    ): Promise<Message> {
      try {
        const currentUserId = await getCurrentUserId();

        const messageData = {
          content,
          messageType: "TEXT",
          ...(attachments?.[0] && {
            attachmentUrl: attachments[0].url,
            attachmentName: attachments[0].name,
            attachmentSize: 0, // TODO: Calculate actual size
          }),
        };
        
        const backendMessage = await client.post(`/messaging/conversations/${conversationId}/messages`, messageData);
        return convertBackendMessageToFrontendFormat(backendMessage.data as Record<string, unknown>, currentUserId);
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },

    // Mark message as read
    async markMessageAsRead(messageId: string): Promise<void> {
      try {
        await client.post(`/messaging/messages/${messageId}/read`);
      } catch (error) {
        console.error("Error marking message as read:", error);
        throw error;
      }
    },

    // Add reaction to message
    async addMessageReaction(messageId: string, emoji: string): Promise<void> {
      try {
        await client.post(`/messaging/messages/${messageId}/reactions`, { emoji });
      } catch (error) {
        console.error("Error adding reaction:", error);
        throw error;
      }
    },

    // Remove reaction from message
    async removeMessageReaction(
      messageId: string,
      emoji: string
    ): Promise<void> {
      try {
        await client.delete(`/messaging/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
      } catch (error) {
        console.error("Error removing reaction:", error);
        throw error;
      }
    },

    // Search messages
    async searchMessages(
      query: string,
      conversationId?: string
    ): Promise<Message[]> {
      try {
        const currentUserId = await getCurrentUserId();
        const params = new URLSearchParams({ query });
        if (conversationId) {
          params.append("conversationId", conversationId);
        }

        const messages = await client.get(`/messaging/search?${params.toString()}`);
        
        return messages.data.map((msg: Record<string, unknown>) => convertBackendMessageToFrontendFormat(msg, currentUserId));
      } catch (error) {
        console.error("Error searching messages:", error);
        return [];
      }
    },

    // Block user
    async blockUser(userId: string, reason?: string): Promise<void> {
      try {
        await client.post("/messaging/block", { userId, reason });
      } catch (error) {
        console.error("Error blocking user:", error);
        throw error;
      }
    },

    // Unblock user
    async unblockUser(userId: string): Promise<void> {
      try {
        await client.delete(`/messaging/block/${userId}`);
      } catch (error) {
        console.error("Error unblocking user:", error);
        throw error;
      }
    },
  };
};

// Deprecated class for backward compatibility
export class MessagingApiService {
  constructor() {
    console.warn(
      "MessagingApiService is deprecated. Use createMessagingApiService with authentication."
    );
  }

  async fetchContacts(): Promise<Contact[]> {
    console.error(
      "MessagingApiService requires authentication. Use createMessagingApiService."
    );
    return [];
  }

  async fetchConversation(): Promise<Conversation | undefined> {
    console.error(
      "MessagingApiService requires authentication. Use createMessagingApiService."
    );
    return undefined;
  }

  async sendMessage(): Promise<Message> {
    throw new Error(
      "MessagingApiService requires authentication. Use createMessagingApiService."
    );
  }

  async markMessageAsRead(): Promise<void> {
    throw new Error(
      "MessagingApiService requires authentication. Use createMessagingApiService."
    );
  }

  async addMessageReaction(): Promise<void> {
    throw new Error(
      "MessagingApiService requires authentication. Use createMessagingApiService."
    );
  }

  async removeMessageReaction(): Promise<void> {
    throw new Error(
      "MessagingApiService requires authentication. Use createMessagingApiService."
    );
  }

  async searchMessages(): Promise<Message[]> {
    console.error(
      "MessagingApiService requires authentication. Use createMessagingApiService."
    );
    return [];
  }

  async blockUser(): Promise<void> {
    throw new Error(
      "MessagingApiService requires authentication. Use createMessagingApiService."
    );
  }

  async unblockUser(): Promise<void> {
    throw new Error(
      "MessagingApiService requires authentication. Use createMessagingApiService."
    );
  }
}

// Export default instance for backward compatibility
export const messagingApi = new MessagingApiService();
