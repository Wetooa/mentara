// Site-wide metadata constants for Mentara platform
export const SITE_CONFIG = {
  name: "Mentara",
  title: "Mentara - Mental Health Platform",
  description: "Comprehensive mental health platform connecting patients with licensed therapists. Expert care, community support, and personal growth tools for your wellness journey.",
  url: process.env.NEXT_PUBLIC_BASE_URL || "https://mentara.app",
  ogImage: "/opengraph-image.png",
  twitterImage: "/twitter-image.png",
  favicon: "/favicon/favicon.ico",
  appleTouchIcon: "/favicon/apple-touch-icon.png",
  keywords: [
    "mental health",
    "therapy",
    "counseling", 
    "telehealth",
    "therapist",
    "wellness",
    "mental wellness",
    "psychology",
    "online therapy",
    "mental health support",
    "community support",
    "personal growth"
  ],
  author: {
    name: "Mentara Team",
    url: "https://mentara.app/about"
  },
  creator: "@mentara",
  publisher: "Mentara Inc.",
  category: "Health & Wellness",
  locale: "en_US",
  alternateLocales: ["en"],
  themeColor: "#22c55e", // Primary green color
  accentColor: "#16a34a",
  backgroundColor: "#ffffff"
} as const;

export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/mentara",
  facebook: "https://facebook.com/mentara", 
  instagram: "https://instagram.com/mentara",
  linkedin: "https://linkedin.com/company/mentara"
} as const;

export const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Mentara",
  url: SITE_CONFIG.url,
  description: SITE_CONFIG.description,
  logo: `${SITE_CONFIG.url}/logo.png`,
  sameAs: Object.values(SOCIAL_LINKS),
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English"]
  }
} as const;

export const DEFAULT_METADATA = {
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    bing: process.env.NEXT_PUBLIC_BING_VERIFICATION,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_CONFIG.name,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - Mental Health Platform`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_CONFIG.creator,
    creator: SITE_CONFIG.creator,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}${SITE_CONFIG.twitterImage}`],
  },
  icons: {
    icon: [
      { url: SITE_CONFIG.favicon, sizes: "any" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: SITE_CONFIG.appleTouchIcon, sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/favicon/safari-pinned-tab.svg", color: SITE_CONFIG.themeColor },
    ],
  },
} as const;

// Role-specific metadata configurations
export const ROLE_METADATA = {
  client: {
    title: "Client Dashboard - Mentara",
    description: "Access your therapy sessions, worksheets, and wellness journey progress on Mentara's secure client dashboard.",
    keywords: ["client dashboard", "therapy sessions", "mental health tracking", "wellness progress"],
  },
  therapist: {
    title: "Therapist Portal - Mentara", 
    description: "Manage your practice, connect with clients, and provide expert mental health care through Mentara's professional therapist portal.",
    keywords: ["therapist portal", "mental health practice", "client management", "professional therapy"],
  },
  admin: {
    title: "Admin Dashboard - Mentara",
    description: "Administrative control panel for managing users, therapists, and platform operations.",
    keywords: ["admin dashboard", "platform management", "user administration"],
  },
  moderator: {
    title: "Moderator Panel - Mentara",
    description: "Content moderation and community management tools for maintaining a safe mental health environment.",
    keywords: ["content moderation", "community management", "safety tools"],
  },
} as const;

// Notification types for metadata enhancement
export const NOTIFICATION_METADATA = {
  APPOINTMENT_REMINDER: "📅",
  APPOINTMENT_CONFIRMED: "✅", 
  APPOINTMENT_CANCELLED: "❌",
  MESSAGE_RECEIVED: "💬",
  WORKSHEET_ASSIGNED: "📝",
  REVIEW_REQUEST: "⭐",
  COMMUNITY_POST: "👥",
  URGENT: "🚨",
} as const;

export const IMAGE_DIMENSIONS = {
  openGraph: { width: 1200, height: 630 },
  twitter: { width: 1200, height: 630 },
  profile: { width: 400, height: 400 },
  community: { width: 800, height: 400 },
} as const;