// Standardized Real-Time Event System
// This module provides a unified approach to real-time event handling across the application

// Core standardized real-time events hook
export { useRealTimeEvents } from "../useRealTimeEvents";

// Domain-specific real-time hooks
export { useRealTimeMessages } from "../useRealTimeMessages";
export { useRealTimeNotifications } from "../useRealTimeNotifications";
export { useRealTimeMeetings } from "../useRealTimeMeetings";
export { useRealTimeWorksheets } from "../useRealTimeWorksheets";

// Event manager and types
export { RealTimeEventManager } from "@/lib/realtime/realtime-event-manager";
export type { BaseEvent, EventType, EventHandlerConfig } from "@/lib/realtime/realtime-event-manager";

// Usage Examples:
// 
// 1. Basic real-time events (all events):
//    const realTime = useRealTimeEvents({ enableToasts: true });
//
// 2. Messages only:
//    const messages = useRealTimeMessages({ conversationId: "123", userId: "user1" });
//
// 3. Notifications only:
//    const notifications = useRealTimeNotifications({ userId: "user1" });
//
// 4. Meetings only:
//    const meetings = useRealTimeMeetings({ userId: "user1" });
//
// 5. Worksheets only:
//    const worksheets = useRealTimeWorksheets({ userId: "user1" });
//
// 6. Multiple domains:
//    const messages = useRealTimeMessages({ conversationId: "123", userId: "user1" });
//    const notifications = useRealTimeNotifications({ userId: "user1" });
//    const meetings = useRealTimeMeetings({ userId: "user1" });