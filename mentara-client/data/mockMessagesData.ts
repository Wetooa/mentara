// filepath: /home/tr-ggr/NerdProjects/nextjs/mentara/mentara-client/data/mockMessagesData.ts

import {
  Contact,
  Conversation,
  Message,
  MessagesState,
} from "@/components/messages/types";
import { format, subDays, subHours, subMinutes } from "date-fns";

// Helper function to generate timestamps relative to now
const getRelativeTime = (days = 0, hours = 0, minutes = 0) => {
  const date = subMinutes(subHours(subDays(new Date(), days), hours), minutes);
  return date.toISOString();
};

// Format time for display in message bubbles (e.g., "14:30")
const formatMessageTime = (isoString: string) => {
  return format(new Date(isoString), "HH:mm");
};

// Get relative display time for contacts list (e.g., "Yesterday", "14:30", "Monday")
const getDisplayTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return format(date, "HH:mm");
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return format(date, "EEEE"); // Day name
  } else {
    return format(date, "dd/MM"); // Date format
  }
};

// Generate a range of mock contacts
export const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    status: "online",
    lastMessage: "I'll send you the CBT exercises we discussed",
    time: getDisplayTime(getRelativeTime(0, 0, 15)),
    unread: 2,
    avatar: "/team/therapist1.jpg",
    isTyping: false,
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    status: "offline",
    lastMessage: "Let me know how the meditation exercise works for you",
    time: getDisplayTime(getRelativeTime(0, 2, 0)),
    unread: 0,
    avatar: "/team/therapist2.jpg",
  },
  {
    id: "3",
    name: "Dr. Olivia Rodriguez",
    status: "away",
    lastMessage: "Your progress this month has been excellent",
    time: getDisplayTime(getRelativeTime(0, 5, 0)),
    unread: 0,
    avatar: "/team/therapist3.jpg",
  },
  {
    id: "4",
    name: "Support Team",
    status: "online",
    lastMessage: "Is there anything else you need help with today?",
    time: getDisplayTime(getRelativeTime(1, 0, 0)),
    unread: 0,
    avatar: "/avatar-placeholder.png",
  },
  {
    id: "5",
    name: "Dr. James Wilson",
    status: "offline",
    lastMessage: "I've updated your treatment plan based on our last session",
    time: getDisplayTime(getRelativeTime(2, 0, 0)),
    unread: 0,
    avatar: "/team/therapist4.jpg",
  },
  {
    id: "6",
    name: "Community Moderator",
    status: "online",
    lastMessage: "Thank you for your contribution to the anxiety support group",
    time: getDisplayTime(getRelativeTime(3, 0, 0)),
    unread: 0,
    avatar: "/avatar-placeholder.png",
  },
  {
    id: "7",
    name: "Appointment Scheduler",
    status: "online",
    lastMessage: "Your appointment has been confirmed for May 20th at 2:00 PM",
    time: getDisplayTime(getRelativeTime(4, 0, 0)),
    unread: 0,
    avatar: "/avatar-placeholder.png",
  },
  {
    id: "8",
    name: "Dr. Emma Williams",
    status: "offline",
    lastMessage: "I've shared some resources about sleep hygiene",
    time: getDisplayTime(getRelativeTime(5, 0, 0)),
    unread: 0,
    avatar: "/team/claire2.jpg",
  },
];

// Generate mock conversations for each contact
export const mockConversations: Conversation[] = [
  // Dr. Sarah Johnson conversation (more detailed example)
  {
    id: "conv-1",
    contactId: "1",
    messages: [
      {
        id: "msg-1-1",
        sender: "them",
        text: "Hello! How are you feeling today after our session yesterday?",
        time: formatMessageTime(getRelativeTime(0, 3, 50)),
        status: "read",
      },
      {
        id: "msg-1-2",
        sender: "me",
        text: "I'm doing better, thanks. Those breathing exercises helped me calm down during a stressful meeting.",
        time: formatMessageTime(getRelativeTime(0, 3, 45)),
        status: "read",
      },
      {
        id: "msg-1-3",
        sender: "them",
        text: "That's wonderful to hear! It's great that you were able to apply those techniques in a real situation.",
        time: formatMessageTime(getRelativeTime(0, 3, 40)),
        status: "read",
      },
      {
        id: "msg-1-4",
        sender: "them",
        text: "Would you like me to send you some additional CBT exercises that might help with work-related stress?",
        time: formatMessageTime(getRelativeTime(0, 3, 35)),
        status: "read",
      },
      {
        id: "msg-1-5",
        sender: "me",
        text: "Yes, that would be great! I have an important presentation next week that I'm feeling anxious about.",
        time: formatMessageTime(getRelativeTime(0, 3, 30)),
        status: "read",
      },
      {
        id: "msg-1-6",
        sender: "them",
        text: "I understand. Presentations can be challenging, but you have the skills to handle it well.",
        time: formatMessageTime(getRelativeTime(0, 2, 0)),
        status: "read",
      },
      {
        id: "msg-1-7",
        sender: "them",
        text: "I'll prepare a tailored set of exercises specifically for presentation anxiety and send them to you this afternoon.",
        time: formatMessageTime(getRelativeTime(0, 1, 50)),
        status: "read",
      },
      {
        id: "msg-1-8",
        sender: "me",
        text: "Thank you so much, that would be very helpful.",
        time: formatMessageTime(getRelativeTime(0, 1, 45)),
        status: "read",
      },
      {
        id: "msg-1-9",
        sender: "them",
        text: "I've just finished preparing those exercises for you. They include visualization techniques and cognitive restructuring specifically for presentations.",
        time: formatMessageTime(getRelativeTime(0, 0, 20)),
        status: "delivered",
      },
      {
        id: "msg-1-10",
        sender: "them",
        text: "I'll send you the CBT exercises we discussed",
        time: formatMessageTime(getRelativeTime(0, 0, 15)),
        status: "delivered",
        attachments: [
          {
            id: "att-1",
            type: "document",
            url: "/files/presentation_anxiety_exercises.pdf",
            name: "Presentation Anxiety Exercises.pdf",
            size: 1240000,
          },
        ],
      },
    ],
    lastReadMessageId: "msg-1-8",
  },

  // Dr. Michael Chen conversation
  {
    id: "conv-2",
    contactId: "2",
    messages: [
      {
        id: "msg-2-1",
        sender: "them",
        text: "Based on our last session, I think daily meditation might help with your sleep issues.",
        time: formatMessageTime(getRelativeTime(0, 5, 0)),
        status: "read",
      },
      {
        id: "msg-2-2",
        sender: "me",
        text: "I haven't tried meditation before. How long should I meditate each day?",
        time: formatMessageTime(getRelativeTime(0, 4, 50)),
        status: "read",
      },
      {
        id: "msg-2-3",
        sender: "them",
        text: "Start with just 5 minutes before bed. I'm sending you a guided meditation that's perfect for beginners.",
        time: formatMessageTime(getRelativeTime(0, 4, 40)),
        status: "read",
        attachments: [
          {
            id: "att-2",
            type: "audio",
            url: "/files/guided_meditation.mp3",
            name: "Beginner's Guided Meditation.mp3",
            size: 4500000,
          },
        ],
      },
      {
        id: "msg-2-4",
        sender: "me",
        text: "Thank you, I'll try it tonight.",
        time: formatMessageTime(getRelativeTime(0, 4, 30)),
        status: "read",
      },
      {
        id: "msg-2-5",
        sender: "them",
        text: "Let me know how the meditation exercise works for you",
        time: formatMessageTime(getRelativeTime(0, 2, 0)),
        status: "delivered",
      },
    ],
    lastReadMessageId: "msg-2-4",
  },

  // Generate shorter conversations for other contacts
  {
    id: "conv-3",
    contactId: "3",
    messages: [
      {
        id: "msg-3-1",
        sender: "them",
        text: "I've reviewed your journal entries from this month. I'm really impressed with your progress!",
        time: formatMessageTime(getRelativeTime(0, 6, 0)),
        status: "read",
      },
      {
        id: "msg-3-2",
        sender: "me",
        text: "Thank you! I've been working hard on being more mindful in my daily interactions.",
        time: formatMessageTime(getRelativeTime(0, 5, 50)),
        status: "read",
      },
      {
        id: "msg-3-3",
        sender: "them",
        text: "Your progress this month has been excellent",
        time: formatMessageTime(getRelativeTime(0, 5, 0)),
        status: "read",
      },
    ],
  },

  // Support team conversation with unread messages
  {
    id: "conv-4",
    contactId: "4",
    messages: [
      {
        id: "msg-4-1",
        sender: "them",
        text: "Hello! This is the Mentara support team. How can we help you today?",
        time: formatMessageTime(getRelativeTime(1, 2, 0)),
        status: "read",
      },
      {
        id: "msg-4-2",
        sender: "me",
        text: "I'm having trouble finding the worksheets my therapist assigned me last week.",
        time: formatMessageTime(getRelativeTime(1, 1, 50)),
        status: "read",
      },
      {
        id: "msg-4-3",
        sender: "them",
        text: "I'd be happy to help you locate those. You can find all your assigned worksheets in the 'Worksheets' tab in the main navigation menu.",
        time: formatMessageTime(getRelativeTime(1, 1, 40)),
        status: "read",
      },
      {
        id: "msg-4-4",
        sender: "me",
        text: "Thanks, I found them. I also noticed there's a new community feature?",
        time: formatMessageTime(getRelativeTime(1, 1, 30)),
        status: "read",
      },
      {
        id: "msg-4-5",
        sender: "them",
        text: "Yes! We recently launched support communities where you can connect with others experiencing similar challenges. Would you like me to tell you more about it?",
        time: formatMessageTime(getRelativeTime(1, 1, 20)),
        status: "read",
      },
      {
        id: "msg-4-6",
        sender: "them",
        text: "Is there anything else you need help with today?",
        time: formatMessageTime(getRelativeTime(1, 0, 0)),
        status: "delivered",
      },
    ],
    lastReadMessageId: "msg-4-5",
  },
];

// Complete messages state for the application
export const initialMessagesState: MessagesState = {
  contacts: mockContacts,
  conversations: mockConversations,
  selectedContactId: "1", // Default to the first conversation
  isLoadingMessages: false,
  error: null,
};

// Helper function to get conversation by contact ID
export const getConversationByContactId = (
  contactId: string
): Conversation | undefined => {
  return mockConversations.find((conv) => conv.contactId === contactId);
};

// Helper function to get contact by ID
export const getContactById = (contactId: string): Contact | undefined => {
  return mockContacts.find((contact) => contact.id === contactId);
};

// Helper function to group messages by date for display
export const groupMessagesByDate = (messages: Message[]) => {
  const groups: { [date: string]: Message[] } = {};

  messages.forEach((message) => {
    // Extract date from ISO string if available, or use current date with time
    let dateKey: string;

    try {
      // Check if the time string has a valid date component
      if (message.time.includes("T") || message.time.includes("-")) {
        // It's likely an ISO date string
        const messageDate = new Date(message.time);
        dateKey = format(messageDate, "yyyy-MM-dd");
      } else {
        // It's just a time string like "14:30" - use current date
        const today = new Date();
        const [hours, minutes] = message.time.split(":").map(Number);

        if (!isNaN(hours) && !isNaN(minutes)) {
          today.setHours(hours, minutes, 0, 0);
        }

        dateKey = format(today, "yyyy-MM-dd");
      }
    } catch (err) {
      // Fallback to current date if there's any parsing error
      console.error("Error parsing message time:", message.time);
      dateKey = format(new Date(), "yyyy-MM-dd");
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(message);
  });

  return Object.entries(groups).map(([date, messages]) => ({
    date,
    messages,
  }));
};

// Function to simulate API call to fetch contacts
export const fetchContacts = async (): Promise<Contact[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockContacts;
};

// Function to simulate API call to fetch a conversation
export const fetchConversation = async (
  contactId: string
): Promise<Conversation | undefined> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 700));
  return getConversationByContactId(contactId);
};

// Function to simulate sending a message
export const sendMessage = async (
  contactId: string,
  text: string,
  attachments?: { name: string; url: string; type: string }[]
): Promise<Message> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newMessage: Message = {
    id: `msg-new-${Date.now()}`,
    sender: "me",
    text,
    time: formatMessageTime(new Date().toISOString()),
    status: "sent",
    attachments: attachments?.map((att, i) => ({
      id: `att-new-${Date.now()}-${i}`,
      name: att.name,
      url: att.url,
      type: att.type as any,
      size: Math.floor(Math.random() * 1000000) + 100000,
    })),
  };

  return newMessage;
};

// Export all for easy access
export default {
  mockContacts,
  mockConversations,
  initialMessagesState,
  getConversationByContactId,
  getContactById,
  groupMessagesByDate,
  fetchContacts,
  fetchConversation,
  sendMessage,
};
