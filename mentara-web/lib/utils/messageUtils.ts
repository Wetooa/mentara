import { Message } from "@/components/messages/types";

/**
 * Utility functions for messaging functionality
 */

export interface MessageGroup {
  date: string;
  messages: Message[];
}

/**
 * Groups messages by date for chat display
 * @param messages Array of messages to group
 * @returns Array of message groups sorted by date
 */
export function groupMessagesByDate(messages: Message[]): MessageGroup[] {
  const groups: { [date: string]: Message[] } = {};
  
  messages.forEach((message) => {
    // Parse the time field to create a proper date
    // For now, use current date since mock messages don't have proper timestamps
    // In real implementation, this would use message.createdAt or similar
    let messageDate: Date;
    
    try {
      // Try to parse the time field, fallback to current date
      if (message.time && message.time.includes(':')) {
        // For time strings like "10:30 AM", use today's date
        messageDate = new Date();
      } else {
        // For relative dates like "Yesterday"
        if (message.time === 'Yesterday') {
          messageDate = new Date();
          messageDate.setDate(messageDate.getDate() - 1);
        } else {
          messageDate = new Date();
        }
      }
    } catch {
      messageDate = new Date();
    }
    
    const dateKey = messageDate.toDateString();
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });
  
  // Convert to array format expected by components and sort by date
  return Object.entries(groups)
    .map(([date, messages]) => ({
      date,
      messages: messages.sort((a, b) => {
        // Sort messages within each group by time
        // For now, use creation order since time parsing is complex
        return 0;
      }),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Formats a date string for display in message groups
 * @param dateString Date string to format
 * @returns Formatted date label
 */
export function formatDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();

  // Compare year, month, day
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return "Today";
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  // Default to date format
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Formats message timestamp for display
 * @param timestamp Timestamp string or Date
 * @returns Formatted time string
 */
export function formatMessageTime(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Checks if two messages are from the same sender (for message grouping)
 * @param message1 First message
 * @param message2 Second message
 * @returns True if messages are from same sender
 */
export function isSameSender(message1: Message, message2: Message): boolean {
  return message1.sender === message2.sender;
}

/**
 * Checks if messages should be grouped together (same sender, within time threshold)
 * @param message1 First message
 * @param message2 Second message
 * @param maxGapMinutes Maximum time gap in minutes to still group messages
 * @returns True if messages should be grouped
 */
export function shouldGroupMessages(
  message1: Message, 
  message2: Message, 
  maxGapMinutes: number = 5
): boolean {
  if (!isSameSender(message1, message2)) {
    return false;
  }

  // For now, just group by sender since we don't have proper timestamps
  // In real implementation, this would check time difference
  return true;
}