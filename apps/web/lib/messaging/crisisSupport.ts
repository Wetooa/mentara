/**
 * Crisis Support Resources for Philippines
 * Mental health hotlines and crisis support services
 */

export interface CrisisHotline {
  id: string;
  name: string;
  phone: string;
  textNumber?: string;
  website?: string;
  availability: string;
  description: string;
  languages: string[];
  isPrimary?: boolean;
}

export const PHILIPPINES_CRISIS_HOTLINES: CrisisHotline[] = [
  {
    id: "ncmh",
    name: "National Center for Mental Health (NCMH) Crisis Hotline",
    phone: "0917-899-USAP",
    textNumber: "0917-899-8727",
    website: "https://ncmh.gov.ph",
    availability: "24/7",
    description: "Free mental health crisis support and counseling",
    languages: ["Tagalog", "English", "Filipino"],
    isPrimary: true,
  },
  {
    id: "hopeline",
    name: "Hopeline Philippines",
    phone: "(02) 8804-4673",
    textNumber: "0917-558-4673",
    website: "https://hopelineph.org",
    availability: "24/7",
    description: "Crisis intervention and suicide prevention hotline",
    languages: ["Tagalog", "English"],
    isPrimary: true,
  },
  {
    id: "intouch",
    name: "In Touch Community Services",
    phone: "(02) 8893-7603",
    textNumber: "0917-800-1123",
    website: "https://in-touch.org",
    availability: "24/7",
    description: "Crisis counseling and mental health support",
    languages: ["Tagalog", "English"],
    isPrimary: true,
  },
  {
    id: "emergency",
    name: "Emergency Services (Philippines)",
    phone: "911",
    availability: "24/7",
    description: "Immediate emergency response for life-threatening situations",
    languages: ["Tagalog", "English"],
    isPrimary: true,
  },
  {
    id: "doh",
    name: "Department of Health (DOH) Mental Health Program",
    phone: "(02) 8651-7800",
    website: "https://doh.gov.ph",
    availability: "Business hours",
    description: "Government mental health support and resources",
    languages: ["Tagalog", "English"],
  },
];

export interface CrisisMessageTemplate {
  id: string;
  title: string;
  message: string;
  tagalogMessage?: string;
  priority: "urgent" | "high" | "normal";
}

export const CRISIS_MESSAGE_TEMPLATES: CrisisMessageTemplate[] = [
  {
    id: "urgent-help",
    title: "I need urgent help",
    message: "I'm experiencing a mental health crisis and need immediate support. Please help me.",
    tagalogMessage: "Nakaranas ako ng mental health crisis at kailangan ko ng agarang suporta. Pakitulungan ako.",
    priority: "urgent",
  },
  {
    id: "feeling-overwhelmed",
    title: "I'm feeling overwhelmed",
    message: "I'm feeling overwhelmed and struggling to cope. Can we talk?",
    tagalogMessage: "Nababagabag ako at nahihirapan akong makayanan. Pwede ba tayong mag-usap?",
    priority: "high",
  },
  {
    id: "panic-attack",
    title: "I'm having a panic attack",
    message: "I'm having a panic attack and need support right now.",
    tagalogMessage: "May panic attack ako at kailangan ko ng suporta ngayon.",
    priority: "urgent",
  },
  {
    id: "suicidal-thoughts",
    title: "I'm having suicidal thoughts",
    message: "I'm having thoughts of self-harm. I need immediate support.",
    tagalogMessage: "May mga kaisipan ako ng pagpapakamatay. Kailangan ko ng agarang suporta.",
    priority: "urgent",
  },
];

/**
 * Get primary crisis hotlines
 */
export function getPrimaryHotlines(): CrisisHotline[] {
  return PHILIPPINES_CRISIS_HOTLINES.filter((h) => h.isPrimary);
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Format: 0917-899-USAP or (02) 8804-4673
  return phone;
}

/**
 * Get crisis message template by ID
 */
export function getCrisisTemplate(id: string): CrisisMessageTemplate | undefined {
  return CRISIS_MESSAGE_TEMPLATES.find((t) => t.id === id);
}

