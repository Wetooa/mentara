export type UserStatus = "online" | "offline" | "away";
export type MessageStatus = "sent" | "delivered" | "read";

export interface Contact {
  id: string;
  name: string;
  status: UserStatus;
  lastMessage: string;
  time: string;
  unread: number;
  avatar?: string;
  isTyping?: boolean;
}

export interface Message {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  status?: MessageStatus;
  attachments?: Attachment[];
  isDeleted?: boolean;
  reactions?: Reaction[];
  replyTo?: string; // ID of the message being replied to
}

export interface Attachment {
  id: string;
  type: "image" | "document" | "audio" | "video";
  url: string;
  name: string;
  size?: number;
  previewUrl?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // IDs of users who reacted
}

export interface Conversation {
  id: string;
  contactId: string;
  messages: Message[];
  lastReadMessageId?: string;
}

// For grouping messages by date
export interface MessageGroup {
  date: string;
  messages: Message[];
}

// Interface for the entire messages state
export interface MessagesState {
  contacts: Contact[];
  conversations: Conversation[];
  selectedContactId: string | null;
  isLoadingMessages: boolean;
  error: string | null;
}
