/**
 * Philippines-Specific Mental Health Context
 * Resources, cultural considerations, and localization
 */

export interface PhilippinesMentalHealthResource {
  id: string;
  name: string;
  type: "hotline" | "center" | "organization" | "online";
  phone?: string;
  website?: string;
  region?: string;
  languages: string[];
  description: string;
  tagalogDescription: string;
}

export const PHILIPPINES_MENTAL_HEALTH_RESOURCES: PhilippinesMentalHealthResource[] = [
  {
    id: "ncmh",
    name: "National Center for Mental Health",
    type: "hotline",
    phone: "0917-899-USAP",
    website: "https://ncmh.gov.ph",
    region: "National",
    languages: ["Tagalog", "English", "Filipino"],
    description: "Free mental health crisis support and counseling",
    tagalogDescription: "Libreng suporta sa mental health crisis at counseling",
  },
  {
    id: "hopeline",
    name: "Hopeline Philippines",
    type: "hotline",
    phone: "(02) 8804-4673",
    website: "https://hopelineph.org",
    region: "National",
    languages: ["Tagalog", "English"],
    description: "Crisis intervention and suicide prevention",
    tagalogDescription: "Interbensyon sa krisis at pag-iwas sa pagpapakamatay",
  },
  {
    id: "intouch",
    name: "In Touch Community Services",
    type: "hotline",
    phone: "(02) 8893-7603",
    website: "https://in-touch.org",
    region: "National",
    languages: ["Tagalog", "English"],
    description: "Crisis counseling and mental health support",
    tagalogDescription: "Crisis counseling at suporta sa mental health",
  },
  {
    id: "doh",
    name: "Department of Health Mental Health Program",
    type: "center",
    phone: "(02) 8651-7800",
    website: "https://doh.gov.ph",
    region: "National",
    languages: ["Tagalog", "English"],
    description: "Government mental health support and resources",
    tagalogDescription: "Suporta at resources sa mental health mula sa gobyerno",
  },
];

export interface CulturalContext {
  greeting: string;
  tagalogGreeting: string;
  supportivePhrase: string;
  tagalogSupportivePhrase: string;
  culturalNote: string;
}

export const CULTURAL_CONTEXT: CulturalContext[] = [
  {
    greeting: "How are you?",
    tagalogGreeting: "Kumusta ka?",
    supportivePhrase: "I'm here for you",
    tagalogSupportivePhrase: "Nandito lang ako para sa'yo",
    culturalNote: "Filipino culture values 'kapwa' (shared identity) and community support",
  },
  {
    greeting: "How are you feeling?",
    tagalogGreeting: "Paano ka ngayon?",
    supportivePhrase: "Your feelings matter",
    tagalogSupportivePhrase: "Mahalaga ang nararamdaman mo",
    culturalNote: "Mental health discussions are becoming more accepted, but family support is crucial",
  },
  {
    greeting: "Are you okay?",
    tagalogGreeting: "Okay ka lang ba?",
    supportivePhrase: "We'll get through this together",
    tagalogSupportivePhrase: "Makakaraos tayo",
    culturalNote: "Filipinos often use 'tayo' (we) instead of 'ikaw' (you) to show solidarity",
  },
];

/**
 * Get resources by region
 */
export function getResourcesByRegion(region: string): PhilippinesMentalHealthResource[] {
  return PHILIPPINES_MENTAL_HEALTH_RESOURCES.filter(
    (r) => r.region === region || r.region === "National"
  );
}

/**
 * Get resources by language
 */
export function getResourcesByLanguage(language: string): PhilippinesMentalHealthResource[] {
  return PHILIPPINES_MENTAL_HEALTH_RESOURCES.filter((r) =>
    r.languages.includes(language)
  );
}

/**
 * Get cultural context phrase
 */
export function getCulturalPhrase(type: "greeting" | "supportive"): CulturalContext {
  return CULTURAL_CONTEXT[0]; // Return first for now, can be expanded
}

