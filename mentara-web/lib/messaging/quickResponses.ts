/**
 * Quick Response Templates for Therapists
 * Culturally appropriate responses in Tagalog and English
 */

export interface QuickResponse {
  id: string;
  category: "support" | "encouragement" | "check-in" | "crisis" | "appointment";
  english: string;
  tagalog: string;
  emoji?: string;
}

export const QUICK_RESPONSES: QuickResponse[] = [
  // Support responses
  {
    id: "here-for-you",
    category: "support",
    english: "I'm here for you. How are you feeling right now?",
    tagalog: "Nandito lang ako para sa'yo. Paano ka ngayon?",
    emoji: "💙",
  },
  {
    id: "feelings-matter",
    category: "support",
    english: "Your feelings are valid and important. Let's talk about what's on your mind.",
    tagalog: "Mahalaga ang nararamdaman mo. Pag-usapan natin ang nasa isip mo.",
    emoji: "🤗",
  },
  {
    id: "proud-of-you",
    category: "encouragement",
    english: "I'm proud of you for reaching out. That takes courage.",
    tagalog: "Ipinagmamalaki kita na lumapit ka. Kailangan ng lakas ng loob para doon.",
    emoji: "🌟",
  },
  {
    id: "not-alone",
    category: "support",
    english: "You're not alone in this. We'll work through this together.",
    tagalog: "Hindi ka nag-iisa. Magtutulungan tayo.",
    emoji: "🤝",
  },
  
  // Check-in responses
  {
    id: "how-are-you",
    category: "check-in",
    english: "How are you doing today?",
    tagalog: "Kumusta ka ngayon?",
    emoji: "💭",
  },
  {
    id: "how-feeling",
    category: "check-in",
    english: "How are you feeling? I'm here to listen.",
    tagalog: "Paano ka? Nandito ako para makinig.",
    emoji: "👂",
  },
  {
    id: "check-in-later",
    category: "check-in",
    english: "I'll check in with you later. Take care of yourself.",
    tagalog: "Magte-text ako mamaya. Ingat ka.",
    emoji: "📱",
  },
  
  // Encouragement responses
  {
    id: "doing-great",
    category: "encouragement",
    english: "You're doing great. Keep going, one step at a time.",
    tagalog: "Magaling ka. Tuloy lang, isa-isa lang.",
    emoji: "💪",
  },
  {
    id: "progress",
    category: "encouragement",
    english: "I can see the progress you're making. Keep it up!",
    tagalog: "Nakikita ko ang pag-unlad mo. Tuloy lang!",
    emoji: "📈",
  },
  {
    id: "strong-person",
    category: "encouragement",
    english: "You're stronger than you think. We'll get through this.",
    tagalog: "Mas malakas ka kaysa sa iniisip mo. Makakaraos tayo.",
    emoji: "💎",
  },
  
  // Crisis responses
  {
    id: "immediate-support",
    category: "crisis",
    english: "I'm here for immediate support. Let's talk right now.",
    tagalog: "Nandito ako para sa agarang suporta. Mag-usap tayo ngayon.",
    emoji: "🚨",
  },
  {
    id: "safety-first",
    category: "crisis",
    english: "Your safety is my priority. Let's make sure you're okay.",
    tagalog: "Ang kaligtasan mo ang prayoridad ko. Siguraduhin nating okay ka.",
    emoji: "🛡️",
  },
  {
    id: "call-hotline",
    category: "crisis",
    english: "If you need immediate help, please call NCMH Crisis Hotline: 0917-899-USAP",
    tagalog: "Kung kailangan mo ng agarang tulong, tawagan mo ang NCMH Crisis Hotline: 0917-899-USAP",
    emoji: "📞",
  },
  
  // Appointment responses
  {
    id: "schedule-session",
    category: "appointment",
    english: "Would you like to schedule a session? I have availability this week.",
    tagalog: "Gusto mo bang mag-schedule ng session? May available ako ngayong linggo.",
    emoji: "📅",
  },
  {
    id: "reschedule",
    category: "appointment",
    english: "I understand you need to reschedule. Let me know what works for you.",
    tagalog: "Naiintindihan ko na kailangan mong mag-reschedule. Sabihin mo kung kailan ka available.",
    emoji: "🔄",
  },
];

/**
 * Get responses by category
 */
export function getResponsesByCategory(category: QuickResponse["category"]): QuickResponse[] {
  return QUICK_RESPONSES.filter((r) => r.category === category);
}

/**
 * Get response by ID
 */
export function getResponseById(id: string): QuickResponse | undefined {
  return QUICK_RESPONSES.find((r) => r.id === id);
}

/**
 * Search responses by keyword
 */
export function searchResponses(keyword: string, tagalog = false): QuickResponse[] {
  const lowerKeyword = keyword.toLowerCase();
  return QUICK_RESPONSES.filter((r) => {
    const text = tagalog ? r.tagalog : r.english;
    return text.toLowerCase().includes(lowerKeyword);
  });
}

