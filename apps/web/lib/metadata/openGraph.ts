import { OpenGraph } from "next/dist/lib/metadata/types/opengraph-types";
import { SITE_CONFIG, IMAGE_DIMENSIONS } from "./constants";

export interface OpenGraphOptions {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  siteName?: string;
  videos?: Array<{
    url: string;
    width?: number;
    height?: number;
    type?: string;
  }>;
  audio?: Array<{
    url: string;
    type?: string;
  }>;
}

/**
 * Generate comprehensive Open Graph metadata for social sharing
 */
export function generateOpenGraphMetadata(options: OpenGraphOptions): OpenGraph {
  const {
    title,
    description,
    image,
    url,
    type = "website",
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = [],
    locale = SITE_CONFIG.locale,
    siteName = SITE_CONFIG.name,
    videos = [],
    audio = [],
  } = options;

  // Generate image array with fallbacks
  const images = [];
  
  if (image) {
    // Custom image
    images.push({
      url: image.startsWith("http") ? image : `${SITE_CONFIG.url}${image}`,
      width: IMAGE_DIMENSIONS.openGraph.width,
      height: IMAGE_DIMENSIONS.openGraph.height,
      alt: `${title} - ${siteName}`,
      type: "image/png",
    });
  }
  
  // Always include default fallback
  images.push({
    url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
    width: IMAGE_DIMENSIONS.openGraph.width,
    height: IMAGE_DIMENSIONS.openGraph.height,
    alt: `${siteName} - Mental Health Platform`,
    type: "image/png",
  });

  const openGraph: OpenGraph = {
    title,
    description,
    url: url ? (url.startsWith("http") ? url : `${SITE_CONFIG.url}${url}`) : SITE_CONFIG.url,
    siteName,
    locale,
    type,
    images,
  };

  // Add type-specific metadata
  switch (type) {
    case "article":
      if (publishedTime) {
        openGraph.publishedTime = publishedTime;
      }
      if (modifiedTime) {
        openGraph.modifiedTime = modifiedTime;
      }
      if (author) {
        openGraph.authors = [author];
      }
      if (section) {
        openGraph.section = section;
      }
      if (tags.length > 0) {
        openGraph.tags = tags;
      }
      break;

    case "profile":
      // Profile-specific metadata can be added here
      break;

    case "website":
    default:
      // Website-specific metadata
      break;
  }

  // Add media if provided
  if (videos.length > 0) {
    openGraph.videos = videos.map(video => ({
      url: video.url.startsWith("http") ? video.url : `${SITE_CONFIG.url}${video.url}`,
      width: video.width,
      height: video.height,
      type: video.type,
    }));
  }

  if (audio.length > 0) {
    openGraph.audio = audio.map(audioItem => ({
      url: audioItem.url.startsWith("http") ? audioItem.url : `${SITE_CONFIG.url}${audioItem.url}`,
      type: audioItem.type,
    }));
  }

  return openGraph;
}

/**
 * Generate Open Graph metadata specifically for user profiles
 */
export function generateProfileOpenGraph(profile: {
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  role: string;
  specializations?: string[];
}): OpenGraph {
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const title = profile.role === "therapist" 
    ? `${fullName} - Licensed Therapist`
    : `${fullName} - ${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}`;

  const description = profile.bio || 
    (profile.role === "therapist" 
      ? `Licensed mental health professional ${profile.specializations?.length ? `specializing in ${profile.specializations.join(", ")}` : ""} on Mentara platform.`
      : `${fullName}'s profile on Mentara mental health platform.`);

  return generateOpenGraphMetadata({
    title,
    description,
    image: profile.avatarUrl,
    type: "profile",
  });
}

/**
 * Generate Open Graph metadata for community pages
 */
export function generateCommunityOpenGraph(community: {
  name: string;
  description: string;
  imageUrl?: string;
  memberCount?: number;
  slug: string;
}): OpenGraph {
  const title = `${community.name} - Mental Health Community`;
  const memberText = community.memberCount ? ` Join ${community.memberCount.toLocaleString()} members` : "";
  const description = `${community.description}${memberText} in this supportive mental health community.`;

  return generateOpenGraphMetadata({
    title,
    description,
    image: community.imageUrl,
    url: `/community/${community.slug}`,
    type: "website",
  });
}

/**
 * Generate Open Graph metadata for articles/posts
 */
export function generateArticleOpenGraph(article: {
  title: string;
  summary?: string;
  content?: string;
  authorName?: string;
  publishedAt?: string;
  updatedAt?: string;
  imageUrl?: string;
  communityName?: string;
  tags?: string[];
  slug?: string;
}): OpenGraph {
  const title = `${article.title} - ${article.communityName || SITE_CONFIG.name}`;
  
  // Generate description from summary or content
  let description = article.summary;
  if (!description && article.content) {
    // Extract first 160 characters from content, clean HTML if present
    description = article.content
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .substring(0, 160)
      .trim();
    if (article.content.length > 160) {
      description += "...";
    }
  }
  description = description || `Mental health discussion by ${article.authorName || "community member"}.`;

  return generateOpenGraphMetadata({
    title,
    description,
    image: article.imageUrl,
    url: article.slug ? `/post/${article.slug}` : undefined,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    author: article.authorName,
    section: article.communityName,
    tags: article.tags,
  });
}

/**
 * Generate Twitter Card metadata (complementary to Open Graph)
 */
export function generateTwitterMetadata(options: {
  title: string;
  description: string;
  image?: string;
  cardType?: "summary" | "summary_large_image" | "app" | "player";
  site?: string;
  creator?: string;
}) {
  const {
    title,
    description,
    image,
    cardType = "summary_large_image",
    site = SITE_CONFIG.creator,
    creator = SITE_CONFIG.creator,
  } = options;

  return {
    card: cardType,
    site,
    creator,
    title,
    description,
    images: image ? [image.startsWith("http") ? image : `${SITE_CONFIG.url}${image}`] : [`${SITE_CONFIG.url}${SITE_CONFIG.twitterImage}`],
  };
}

/**
 * Generate Open Graph metadata for therapist listings
 */
export function generateTherapistListingOpenGraph(therapists: Array<{
  firstName: string;
  lastName: string;
  specializations?: string[];
  approaches?: string[];
}>, filters?: {
  specialization?: string;
  approach?: string;
  location?: string;
}) {
  let title = "Find Licensed Therapists - Mentara";
  let description = `Browse ${therapists.length} licensed mental health professionals`;

  if (filters?.specialization) {
    title = `${filters.specialization} Therapists - Mentara`;
    description = `Find licensed therapists specializing in ${filters.specialization}`;
  }

  if (filters?.location) {
    description += ` in ${filters.location}`;
  }

  description += ". Expert mental health care with secure online therapy sessions.";

  const specializations = [...new Set(therapists.flatMap(t => t.specializations || []))];
  
  return generateOpenGraphMetadata({
    title,
    description,
    url: "/therapists",
    type: "website",
    tags: ["therapist directory", "mental health professionals", ...specializations.slice(0, 5)],
  });
}

/**
 * Helper to validate and optimize image URLs for Open Graph
 */
export function optimizeOpenGraphImage(imageUrl?: string, fallbackType?: "profile" | "community" | "default"): string {
  if (!imageUrl) {
    switch (fallbackType) {
      case "profile":
        return `${SITE_CONFIG.url}/og/profile-default.png`;
      case "community":
        return `${SITE_CONFIG.url}/og/community-default.png`;
      default:
        return `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`;
    }
  }

  // Ensure absolute URL
  if (!imageUrl.startsWith("http")) {
    return `${SITE_CONFIG.url}${imageUrl}`;
  }

  return imageUrl;
}