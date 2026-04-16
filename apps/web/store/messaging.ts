import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/config/storage";

export interface MessagingState {
  // Selected conversation
  selectedConversationId: string | null;
  
  // Target user ID for starting new conversations (deep linking)
  targetUserId: string | null;
  
  // Actions
  setSelectedConversation: (conversationId: string | null) => void;
  setTargetUserId: (userId: string | null) => void;
  clearSelection: () => void;
}

export const useMessagingStore = create<MessagingState>()(
  persist(
    (set) => ({
      // Initial state
      selectedConversationId: null,
      targetUserId: null,

      // Actions
      setSelectedConversation: (conversationId) => {
        set({ selectedConversationId: conversationId });
      },

      setTargetUserId: (userId) => {
        set({ targetUserId: userId });
      },

      clearSelection: () => {
        set({ 
          selectedConversationId: null,
          targetUserId: null 
        });
      },
    }),
    {
      name: STORAGE_KEYS.MESSAGING.SELECTED_CONVERSATION,
      partialize: (state) => ({
        selectedConversationId: state.selectedConversationId,
        targetUserId: state.targetUserId,
      }),
    }
  )
);

