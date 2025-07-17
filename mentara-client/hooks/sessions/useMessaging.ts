// Re-export the modular messaging hooks for backward compatibility
export { useContacts } from "../messaging/useContacts";
export { useConversations } from "../messaging/useConversations";
export { useWebSocket } from "../messaging/useWebSocket";

// Re-export useConversations as the default useMessaging hook
export { useConversations as default } from "../messaging/useConversations";