// Re-export the modular messaging hooks for backward compatibility
export { useContacts } from "../messaging/useContacts";
export { useConversations } from "../messaging/useConversations";
export { useWebSocket } from "../messaging/useWebSocket";

// Re-export useConversations as useMessaging for backward compatibility
export { useConversations as useMessaging } from "../messaging/useConversations";