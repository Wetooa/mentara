import { useState, useEffect } from "react";
import { getStorageItem, setStorageItem } from "@/lib/config/storage";
import type { Mood } from "@/components/messaging/MoodSelector";

interface MoodEntry {
  mood: Mood;
  timestamp: string;
  conversationId?: string;
}

interface UseMoodTrackingReturn {
  currentMood: Mood | null;
  setMood: (mood: Mood, conversationId?: string) => void;
  moodHistory: MoodEntry[];
  getMoodForConversation: (conversationId: string) => Mood | null;
}

const MOOD_STORAGE_KEY = "messaging-mood-history";

export function useMoodTracking(): UseMoodTrackingReturn {
  const [currentMood, setCurrentMood] = useState<Mood | null>(() => {
    if (typeof window === "undefined") return null;
    const history = getStorageItem<MoodEntry[]>(MOOD_STORAGE_KEY, []);
    // Get the most recent mood
    if (history.length > 0) {
      return history[history.length - 1].mood;
    }
    return null;
  });

  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>(() => {
    if (typeof window === "undefined") return [];
    return getStorageItem<MoodEntry[]>(MOOD_STORAGE_KEY, []);
  });

  const setMood = (mood: Mood, conversationId?: string) => {
    setCurrentMood(mood);
    const entry: MoodEntry = {
      mood,
      timestamp: new Date().toISOString(),
      conversationId,
    };

    const newHistory = [...moodHistory, entry].slice(-50); // Keep last 50 entries
    setMoodHistory(newHistory);
    setStorageItem(MOOD_STORAGE_KEY, newHistory);
  };

  const getMoodForConversation = (conversationId: string): Mood | null => {
    // Get the most recent mood for this conversation
    const conversationMoods = moodHistory
      .filter((entry) => entry.conversationId === conversationId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return conversationMoods.length > 0 ? conversationMoods[0].mood : null;
  };

  return {
    currentMood,
    setMood,
    moodHistory,
    getMoodForConversation,
  };
}

