// Mock messages data for messaging components
import { Contact, Message, Conversation, Attachment } from "@/components/messages/types";

// Legacy interfaces for backward compatibility
export interface LegacyContact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
}

export interface LegacyMessage {
  id: string;
  contactId: string;
  content: string;
  timestamp: string;
  isFromUser: boolean;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    status: 'online',
    lastMessage: 'How are you feeling today?',
    time: '10:30 AM',
    unread: 2,
    avatar: '/avatars/therapist1.jpg',
  },
  {
    id: '2', 
    name: 'Dr. Michael Chen',
    status: 'offline',
    lastMessage: 'Thank you for completing the worksheet',
    time: 'Yesterday',
    unread: 0,
    avatar: '/avatars/therapist2.jpg',
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'them',
    text: 'Hello! How are you feeling today?',
    time: '10:30 AM',
    status: 'read',
  },
  {
    id: '2',
    sender: 'me', 
    text: 'I\'m doing better, thank you for asking.',
    time: '10:32 AM',
    status: 'delivered',
  },
];

export const initialMessagesState = {
  contacts: mockContacts,
  messages: mockMessages,
  activeContactId: null,
};

export const fetchContacts = async (): Promise<Contact[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockContacts;
};

export const getContactById = (id: string): Contact | undefined => {
  return mockContacts.find(contact => contact.id === id);
};

export const fetchMessages = async (contactId: string): Promise<Message[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  // Return messages with the new format (no contactId property in new Message type)
  return mockMessages.slice(); // Return all messages for now
};

export const sendMessage = async (contactId: string, content: string, attachments?: Attachment[]): Promise<Message> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const newMessage: Message = {
    id: Date.now().toString(),
    sender: 'me',
    text: content,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'sent',
    attachments: attachments || [],
  };
  
  mockMessages.push(newMessage);
  return newMessage;
};

// Fetch a conversation by contact ID
export const fetchConversation = async (contactId: string): Promise<Conversation | undefined> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Create a mock conversation
  const conversation: Conversation = {
    id: contactId,
    contactId: contactId,
    messages: mockMessages.slice(), // Return all messages for simplicity
    lastReadMessageId: mockMessages[mockMessages.length - 1]?.id,
  };
  
  return conversation;
};

// Group messages by date for chat display
export const groupMessagesByDate = (messages: Message[]): { date: string; messages: Message[] }[] => {
  const groups: { [date: string]: Message[] } = {};
  
  messages.forEach((message) => {
    // Use current date as fallback since mock messages don't have proper timestamps
    const date = new Date().toDateString();
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });
  
  // Convert to array format expected by component
  return Object.entries(groups).map(([date, messages]) => ({
    date,
    messages,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};