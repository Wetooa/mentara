// Mock messages data for messaging components

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
}

export interface Message {
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
    avatar: '/avatars/therapist1.jpg',
    lastMessage: 'How are you feeling today?',
    timestamp: '10:30 AM',
    unreadCount: 2,
  },
  {
    id: '2', 
    name: 'Dr. Michael Chen',
    avatar: '/avatars/therapist2.jpg',
    lastMessage: 'Thank you for completing the worksheet',
    timestamp: 'Yesterday',
    unreadCount: 0,
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    contactId: '1',
    content: 'Hello! How are you feeling today?',
    timestamp: '10:30 AM',
    isFromUser: false,
  },
  {
    id: '2',
    contactId: '1', 
    content: 'I\'m doing better, thank you for asking.',
    timestamp: '10:32 AM',
    isFromUser: true,
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
  return mockMessages.filter(message => message.contactId === contactId);
};

export const sendMessage = async (contactId: string, content: string): Promise<Message> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const newMessage: Message = {
    id: Date.now().toString(),
    contactId,
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isFromUser: true,
  };
  
  mockMessages.push(newMessage);
  return newMessage;
};