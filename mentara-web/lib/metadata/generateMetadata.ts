import { Metadata } from "next";
import { SITE_CONFIG, DEFAULT_METADATA, ROLE_METADATA } from "./constants";
import { generateOpenGraphMetadata } from "./openGraph";
import { generateStructuredData } from "./structuredData";

export interface MetadataOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  keywords?: string[];
  noIndex?: boolean;
  canonicalUrl?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  alternateUrls?: Record<string, string>;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  role: "client" | "therapist" | "admin" | "moderator";
}

export interface TherapistProfile extends UserProfile {
  role: "therapist";
  specializations?: string[];
  approaches?: string[];
  languages?: string[];
  yearsOfExperience?: number;
  education?: string;
  hourlyRate?: number;
  sessionLength?: string;
}

export interface NotificationData {
  unreadCount: number;
  hasUrgent: boolean;
  // Removed latestType since we no longer use complex notification metadata
}

/**
 * Generate comprehensive metadata for pages
 */
export function generatePageMetadata(options: MetadataOptions): Metadata {
  const {
    title,
    description = SITE_CONFIG.description,
    image,
    url,
    type = "website",
    keywords = [],
    noIndex = false,
    canonicalUrl,
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = [],
    locale = SITE_CONFIG.locale,
    alternateUrls = {},
  } = options;

  // Generate full title
  const fullTitle = title 
    ? title.includes(SITE_CONFIG.name) 
      ? title 
      : `${title} | ${SITE_CONFIG.name}`
    : SITE_CONFIG.title;

  // Combine keywords
  const allKeywords = [
    ...SITE_CONFIG.keywords,
    ...keywords,
    ...tags,
  ].filter(Boolean);

  // Base metadata
  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: allKeywords.join(", "),
    authors: author ? [{ name: author }] : [SITE_CONFIG.author],
    creator: SITE_CONFIG.creator,
    publisher: SITE_CONFIG.publisher,
    category: SITE_CONFIG.category,
    ...DEFAULT_METADATA,
  };

  // Handle indexing
  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    };
  }

  // Add canonical URL
  if (canonicalUrl) {
    metadata.alternates = {
      canonical: canonicalUrl,
      ...alternateUrls,
    };
  }

  // Generate Open Graph metadata
  metadata.openGraph = generateOpenGraphMetadata({
    title: fullTitle,
    description,
    image,
    url: url || canonicalUrl,
    type,
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    locale,
  });

  // Update Twitter metadata
  metadata.twitter = {
    ...DEFAULT_METADATA.twitter,
    title: fullTitle,
    description,
    images: image ? [image] : DEFAULT_METADATA.twitter.images,
  };

  return metadata;
}

/**
 * Generate metadata for user profiles
 */
export function generateProfileMetadata(profile: UserProfile | TherapistProfile): Metadata {
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const isTherapist = profile.role === "therapist";
  
  let title: string;
  let description: string;
  let keywords: string[] = [];

  if (isTherapist) {
    const therapist = profile as TherapistProfile;
    title = `${fullName} - Licensed Therapist`;
    
    const specializations = therapist.specializations?.join(", ") || "";
    const experience = therapist.yearsOfExperience ? `${therapist.yearsOfExperience} years experience` : "";
    const approaches = therapist.approaches?.join(", ") || "";
    
    description = `Licensed therapist ${fullName}. ${specializations ? `Specializing in ${specializations}.` : ""} ${experience} ${approaches ? `Therapeutic approaches: ${approaches}.` : ""} ${therapist.bio || "Professional mental health care on Mentara platform."}`.trim();
    
    keywords = [
      "licensed therapist",
      "mental health professional",
      ...(therapist.specializations || []),
      ...(therapist.approaches || []),
      ...(therapist.languages || []),
    ];
  } else {
    title = `${fullName} - ${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}`;
    description = profile.bio || `${fullName}'s profile on Mentara mental health platform.`;
    keywords = [profile.role, "mental health", "community member"];
  }

  return generatePageMetadata({
    title,
    description,
    image: profile.avatarUrl,
    keywords,
    type: "profile",
    noIndex: true, // Privacy: don't index personal profiles
  });
}

/**
 * Generate metadata for role-specific dashboards (simplified)
 */
export function generateRoleMetadata(
  role: keyof typeof ROLE_METADATA
): Metadata {
  const roleConfig = ROLE_METADATA[role];
  
  // Simple title format: "Mentara | [Role]" - no notification indicators
  const title = roleConfig.title;

  return generatePageMetadata({
    title,
    description: roleConfig.description,
    keywords: roleConfig.keywords,
  });
}

/**
 * Generate metadata for community pages
 */
export function generateCommunityMetadata(community: {
  name: string;
  description: string;
  imageUrl?: string;
  memberCount?: number;
  slug: string;
}): Metadata {
  const title = `${community.name} - Mental Health Community`;
  const memberText = community.memberCount ? ` Join ${community.memberCount.toLocaleString()} members` : "";
  const description = `${community.description}${memberText} in this supportive mental health community on Mentara.`;

  return generatePageMetadata({
    title,
    description,
    image: community.imageUrl,
    keywords: ["mental health community", "support group", community.name.toLowerCase()],
    url: `${SITE_CONFIG.url}/community/${community.slug}`,
    type: "website",
  });
}

/**
 * Generate metadata for content/posts
 */
export function generateContentMetadata(content: {
  title: string;
  summary?: string;
  authorName?: string;
  publishedAt?: string;
  updatedAt?: string;
  imageUrl?: string;
  communityName?: string;
  tags?: string[];
}): Metadata {
  const title = `${content.title} - ${content.communityName || "Mentara"}`;
  const description = content.summary || `Mental health discussion and support post by ${content.authorName || "community member"}.`;

  return generatePageMetadata({
    title,
    description,
    image: content.imageUrl,
    type: "article",
    publishedTime: content.publishedAt,
    modifiedTime: content.updatedAt,
    author: content.authorName,
    section: content.communityName,
    tags: content.tags,
    keywords: ["mental health discussion", "community support", ...(content.tags || [])],
  });
}

/**
 * Generate metadata with structured data
 */
export function generateMetadataWithStructuredData(
  options: MetadataOptions,
  structuredDataType?: "Organization" | "HealthcareProvider" | "Article" | "Person",
  structuredDataProps?: Record<string, any>
): Metadata {
  const metadata = generatePageMetadata(options);
  
  if (structuredDataType && structuredDataProps) {
    const structuredData = generateStructuredData(structuredDataType, structuredDataProps);
    
    // Add structured data as JSON-LD script (handled in layout/page components)
    (metadata as any).structuredData = structuredData;
  }
  
  return metadata;
}

/**
 * Update page title with simple format (client-side)
 * Simplified: Always returns "Mentara | [Page Name]" format regardless of notifications
 */
export function updateTitleWithNotifications(
  baseTitle: string,
  _notificationData?: NotificationData
): string {
  // Simple format: just return the base title as "Mentara | [Page]"
  // Notifications are now handled by favicon only, not title
  return baseTitle;
}