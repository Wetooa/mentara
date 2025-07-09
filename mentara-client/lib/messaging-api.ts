import {
  Contact,
  Conversation,
  Message,
  MessageStatus,
} from "@/components/messages/types";
import { format } from "date-fns";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper function to convert backend message to frontend format
const convertBackendMessageToFrontend = (
  backendMessage: any,
  currentUserId: string
): Message => {
  return {
    id: backendMessage.id,
    sender: backendMessage.senderId === currentUserId ? "me" : "them",
    text: backendMessage.content,
    time: format(new Date(backendMessage.createdAt), "HH:mm"),
    status: getMessageStatus(backendMessage, currentUserId),
    attachments: backendMessage.attachmentUrl
      ? [
          {
            id: `attachment-${backendMessage.id}`,
            type: getAttachmentType(backendMessage.attachmentUrl),
            url: backendMessage.attachmentUrl,
            name: backendMessage.attachmentName || "Attachment",
            size: backendMessage.attachmentSize,
          },
        ]
      : undefined,
    reactions: backendMessage.reactions?.map((reaction: any) => ({
      emoji: reaction.emoji,
      count: 1,
      users: [reaction.user.id],
    })),
    replyTo: backendMessage.replyToId,
    isDeleted: backendMessage.isDeleted,
  };
};

// Helper function to determine message status
const getMessageStatus = (
  backendMessage: any,
  currentUserId: string
): MessageStatus => {
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

// Helper function to convert backend conversation to frontend format
const convertBackendConversationToFrontend = (
  backendConversation: any,
  currentUserId: string
): { contact: Contact; conversation: Conversation } => {
  // Find the other participant (not the current user)
  const otherParticipant = backendConversation.participants.find(
    (p: any) => p.userId !== currentUserId
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

// Create authenticated messaging API service
export const createMessagingApiService = (
  getToken: () => Promise<string | null>
) => {
  // Request deduplication to prevent multiple simultaneous calls
  const pendingRequests = new Map<string, Promise<any>>();

  // Helper function to make authenticated requests with deduplication
  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestKey = `${options.method || "GET"}:${endpoint}`;

    // Check if this request is already pending
    if (pendingRequests.has(requestKey)) {
      console.log(`Deduplicating request to ${url}`);
      return pendingRequests.get(requestKey);
    }

    // Create new request promise
    const requestPromise = (async () => {
      try {
        const token = await getToken();

        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        };

        console.log(`Making messaging API request to ${url}`, {
          hasToken: !!token,
        });

        const response = await fetch(url, {
          ...options,
          headers,
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Messaging API Error:", {
            status: response.status,
            statusText: response.statusText,
            errorData,
            endpoint,
          });
          throw new Error(
            errorData.error || `API request failed: ${response.statusText}`
          );
        }

        return response.json();
      } finally {
        // Remove from pending requests when done
        pendingRequests.delete(requestKey);
      }
    })();

    // Store the promise
    pendingRequests.set(requestKey, requestPromise);

    return requestPromise;
  };

  // Get current user ID from token with caching to prevent repeated calls
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
        const userInfo = await makeRequest("/auth/me");
        cachedUserId = userInfo.id;
        return cachedUserId;
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
        const conversations = await makeRequest("/messaging/conversations");

        return conversations.map((conv: any) => {
          const { contact } = convertBackendConversationToFrontend(
            conv,
            currentUserId
          );
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
        const messages = await makeRequest(
          `/messaging/conversations/${conversationId}/messages`
        );

        const convertedMessages = messages.map((msg: any) =>
          convertBackendMessageToFrontend(msg, currentUserId)
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

        const backendMessage = await makeRequest(
          `/messaging/conversations/${conversationId}/messages`,
          {
            method: "POST",
            body: JSON.stringify(messageData),
          }
        );

        return convertBackendMessageToFrontend(backendMessage, currentUserId);
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },

    // Mark message as read
    async markMessageAsRead(messageId: string): Promise<void> {
      try {
        await makeRequest(`/messaging/messages/${messageId}/read`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Error marking message as read:", error);
        throw error;
      }
    },

    // Add reaction to message
    async addMessageReaction(messageId: string, emoji: string): Promise<void> {
      try {
        await makeRequest(`/messaging/messages/${messageId}/reactions`, {
          method: "POST",
          body: JSON.stringify({ emoji }),
        });
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
        await makeRequest(
          `/messaging/messages/${messageId}/reactions/${emoji}`,
          {
            method: "DELETE",
          }
        );
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

        const messages = await makeRequest(
          `/messaging/search?${params.toString()}`
        );

        return messages.map((msg: any) =>
          convertBackendMessageToFrontend(msg, currentUserId)
        );
      } catch (error) {
        console.error("Error searching messages:", error);
        return [];
      }
    },

    // Block user
    async blockUser(userId: string, reason?: string): Promise<void> {
      try {
        await makeRequest("/messaging/block", {
          method: "POST",
          body: JSON.stringify({ userId, reason }),
        });
      } catch (error) {
        console.error("Error blocking user:", error);
        throw error;
      }
    },

    // Unblock user
    async unblockUser(userId: string): Promise<void> {
      try {
        await makeRequest(`/messaging/block/${userId}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error unblocking user:", error);
        throw error;
      }
    },
  };
};

// Backward compatibility - deprecated
class MessagingApiService {
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

// Export singleton for backward compatibility (deprecated)
export const messagingApi = new MessagingApiService();
