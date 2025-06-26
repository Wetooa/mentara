import { Contact, Conversation, Message, MessageStatus } from "@/components/messages/types";
import { format } from "date-fns";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to convert backend message to frontend format
const convertBackendMessageToFrontend = (backendMessage: any, currentUserId: string): Message => {
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
const getMessageStatus = (backendMessage: any, currentUserId: string): MessageStatus => {
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
const getAttachmentType = (url: string): "image" | "document" | "audio" | "video" => {
  const extension = url.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
    return 'image';
  } else if (['mp3', 'wav', 'ogg'].includes(extension || '')) {
    return 'audio';
  } else if (['mp4', 'webm', 'mov'].includes(extension || '')) {
    return 'video';
  }
  
  return 'document';
};

// Helper function to convert backend conversation to frontend format
const convertBackendConversationToFrontend = (
  backendConversation: any, 
  currentUserId: string
): { contact: Contact, conversation: Conversation } => {
  // Find the other participant (not the current user)
  const otherParticipant = backendConversation.participants.find(
    (p: any) => p.userId !== currentUserId
  );
  
  if (!otherParticipant) {
    throw new Error('No other participant found in conversation');
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

// API service class
export class MessagingApiService {
  private authToken: string | null = null;
  
  constructor() {
    if (typeof window !== 'undefined') {
      // Get auth token from local storage or wherever it's stored
      this.authToken = localStorage.getItem('authToken');
    }
  }
  
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers,
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Get current user ID (you'll need to implement this based on your auth system)
  async getCurrentUserId(): Promise<string> {
    // TODO: Implement based on your auth system
    // For now, return a mock ID
    return 'current-user-id';
  }
  
  // Fetch all conversations for the current user
  async fetchContacts(): Promise<Contact[]> {
    try {
      const currentUserId = await this.getCurrentUserId();
      const conversations = await this.makeRequest('/messaging/conversations');
      
      return conversations.map((conv: any) => {
        const { contact } = convertBackendConversationToFrontend(conv, currentUserId);
        return contact;
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  }
  
  // Fetch messages for a specific conversation
  async fetchConversation(conversationId: string): Promise<Conversation | undefined> {
    try {
      const currentUserId = await this.getCurrentUserId();
      const messages = await this.makeRequest(`/messaging/conversations/${conversationId}/messages`);
      
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
      console.error('Error fetching conversation:', error);
      return undefined;
    }
  }
  
  // Send a new message
  async sendMessage(
    conversationId: string, 
    content: string, 
    attachments?: { name: string; url: string; type: string }[]
  ): Promise<Message> {
    try {
      const currentUserId = await this.getCurrentUserId();
      
      const messageData = {
        content,
        messageType: 'TEXT',
        ...(attachments?.[0] && {
          attachmentUrl: attachments[0].url,
          attachmentName: attachments[0].name,
          attachmentSize: 0, // TODO: Calculate actual size
        }),
      };
      
      const backendMessage = await this.makeRequest(
        `/messaging/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify(messageData),
        }
      );
      
      return convertBackendMessageToFrontend(backendMessage, currentUserId);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  // Create a new conversation
  async createConversation(participantIds: string[], type: 'DIRECT' | 'GROUP' = 'DIRECT'): Promise<string> {
    try {
      const conversationData = {
        participantIds,
        type,
      };
      
      const conversation = await this.makeRequest('/messaging/conversations', {
        method: 'POST',
        body: JSON.stringify(conversationData),
      });
      
      return conversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
  
  // Mark message as read
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await this.makeRequest(`/messaging/messages/${messageId}/read`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }
  
  // Add reaction to message
  async addMessageReaction(messageId: string, emoji: string): Promise<void> {
    try {
      await this.makeRequest(`/messaging/messages/${messageId}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ emoji }),
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }
  
  // Remove reaction from message
  async removeMessageReaction(messageId: string, emoji: string): Promise<void> {
    try {
      await this.makeRequest(`/messaging/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  }
  
  // Search messages
  async searchMessages(query: string, conversationId?: string): Promise<Message[]> {
    try {
      const currentUserId = await this.getCurrentUserId();
      const searchParams = new URLSearchParams({ query });
      
      if (conversationId) {
        searchParams.append('conversationId', conversationId);
      }
      
      const messages = await this.makeRequest(`/messaging/search?${searchParams}`);
      
      return messages.map((msg: any) => convertBackendMessageToFrontend(msg, currentUserId));
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }
  
  // Update auth token
  setAuthToken(token: string) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }
}

// Export singleton instance
export const messagingApi = new MessagingApiService();

// Export individual functions for backward compatibility
export const fetchContacts = () => messagingApi.fetchContacts();
export const fetchConversation = (conversationId: string) => messagingApi.fetchConversation(conversationId);
export const sendMessage = (conversationId: string, content: string, attachments?: any[]) => 
  messagingApi.sendMessage(conversationId, content, attachments);