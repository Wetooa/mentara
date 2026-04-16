import { SITE_CONFIG, ORGANIZATION, SOCIAL_LINKS } from "./constants";

export type StructuredDataType = 
  | "Organization" 
  | "HealthcareProvider" 
  | "Article" 
  | "Person" 
  | "WebSite"
  | "LocalBusiness"
  | "MedicalOrganization"
  | "ProfessionalService"
  | "Review"
  | "FAQPage"
  | "BreadcrumbList";

/**
 * Generate JSON-LD structured data for better SEO
 */
export function generateStructuredData(
  type: StructuredDataType,
  data: Record<string, any>
): Record<string, any> {
  const baseContext = "https://schema.org";

  switch (type) {
    case "Organization":
      return generateOrganizationStructuredData(data);
    
    case "HealthcareProvider":
      return generateHealthcareProviderStructuredData(data);
    
    case "Article":
      return generateArticleStructuredData(data);
    
    case "Person":
      return generatePersonStructuredData(data);
    
    case "WebSite":
      return generateWebSiteStructuredData(data);
    
    case "LocalBusiness":
      return generateLocalBusinessStructuredData(data);
    
    case "MedicalOrganization":
      return generateMedicalOrganizationStructuredData(data);
    
    case "ProfessionalService":
      return generateProfessionalServiceStructuredData(data);
    
    case "Review":
      return generateReviewStructuredData(data);
    
    case "FAQPage":
      return generateFAQPageStructuredData(data);
    
    case "BreadcrumbList":
      return generateBreadcrumbListStructuredData(data);
    
    default:
      return {
        "@context": baseContext,
        "@type": type,
        ...data,
      };
  }
}

/**
 * Generate Organization structured data
 */
function generateOrganizationStructuredData(data: Record<string, any>) {
  return {
    ...ORGANIZATION,
    ...data,
  };
}

/**
 * Generate HealthcareProvider structured data for therapists
 */
function generateHealthcareProviderStructuredData(therapist: {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  specializations?: string[];
  approaches?: string[];
  languages?: string[];
  yearsOfExperience?: number;
  education?: string;
  licenseNumber?: string;
  hourlyRate?: number;
  sessionLength?: string;
  avatarUrl?: string;
  rating?: number;
  reviewCount?: number;
}) {
  const fullName = `${therapist.firstName} ${therapist.lastName}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${SITE_CONFIG.url}/therapist/${therapist.id}`,
    name: fullName,
    description: therapist.bio || `Licensed mental health professional specializing in ${therapist.specializations?.join(", ") || "mental health care"}.`,
    image: therapist.avatarUrl,
    url: `${SITE_CONFIG.url}/therapist/${therapist.id}`,
    medicalSpecialty: therapist.specializations?.map(spec => ({
      "@type": "MedicalSpecialty",
      name: spec,
    })) || [],
    knowsLanguage: therapist.languages || ["English"],
    alumniOf: therapist.education ? {
      "@type": "EducationalOrganization",
      name: therapist.education,
    } : undefined,
    hasCredential: therapist.licenseNumber ? {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Professional License",
      identifier: therapist.licenseNumber,
    } : undefined,
    ...(therapist.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: therapist.rating,
        ratingCount: therapist.reviewCount || 1,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    offers: therapist.hourlyRate ? {
      "@type": "Offer",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: therapist.hourlyRate,
        priceCurrency: "USD",
        unitText: "per session",
      },
      availableDeliveryMethod: "OnlineOnly",
      category: "Mental Health Services",
    } : undefined,
    serviceType: "Mental Health Counseling",
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    memberOf: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };
}

/**
 * Generate Article structured data for posts
 */
function generateArticleStructuredData(article: {
  title: string;
  content?: string;
  summary?: string;
  authorName?: string;
  authorId?: string;
  publishedAt?: string;
  updatedAt?: string;
  imageUrl?: string;
  communityName?: string;
  tags?: string[];
  slug?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary || article.content?.substring(0, 160),
    image: article.imageUrl ? [article.imageUrl] : [`${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: article.authorName ? {
      "@type": "Person",
      name: article.authorName,
      url: article.authorId ? `${SITE_CONFIG.url}/profile/${article.authorId}` : undefined,
    } : undefined,
    publisher: ORGANIZATION,
    mainEntityOfPage: article.slug ? {
      "@type": "WebPage",
      "@id": `${SITE_CONFIG.url}/post/${article.slug}`,
    } : undefined,
    articleSection: article.communityName,
    keywords: article.tags?.join(", "),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };
}

/**
 * Generate Person structured data for user profiles
 */
function generatePersonStructuredData(person: {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  role: string;
  location?: string;
}) {
  const fullName = `${person.firstName} ${person.lastName}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_CONFIG.url}/profile/${person.id}`,
    name: fullName,
    description: person.bio || `${fullName}'s profile on ${SITE_CONFIG.name}`,
    image: person.avatarUrl,
    url: `${SITE_CONFIG.url}/profile/${person.id}`,
    jobTitle: person.role === "therapist" ? "Licensed Mental Health Professional" : undefined,
    worksFor: person.role === "therapist" ? ORGANIZATION : undefined,
    address: person.location ? {
      "@type": "PostalAddress",
      addressLocality: person.location,
    } : undefined,
  };
}

/**
 * Generate WebSite structured data
 */
function generateWebSiteStructuredData(data: Record<string, any> = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.url}/#website`,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    publisher: ORGANIZATION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    ...data,
  };
}

/**
 * Generate LocalBusiness structured data
 */
function generateLocalBusinessStructuredData(data: Record<string, any> = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_CONFIG.url}/#business`,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    image: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
    serviceType: "Mental Health Services",
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Mental Health Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Online Therapy Sessions",
            description: "Professional online therapy with licensed mental health professionals",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Mental Health Community Support",
            description: "Peer support groups and community discussions for mental wellness",
          },
        },
      ],
    },
    ...data,
  };
}

/**
 * Generate MedicalOrganization structured data
 */
function generateMedicalOrganizationStructuredData(data: Record<string, any> = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "@id": `${SITE_CONFIG.url}/#medical-organization`,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    medicalSpecialty: [
      "Psychiatry",
      "Psychology", 
      "Mental Health Counseling",
      "Therapy",
    ],
    serviceType: "Telehealth Mental Health Services",
    ...data,
  };
}

/**
 * Generate ProfessionalService structured data
 */
function generateProfessionalServiceStructuredData(service: {
  name: string;
  description: string;
  provider?: string;
  serviceType: string;
  areaServed?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: service.name,
    description: service.description,
    provider: service.provider ? {
      "@type": "Organization",
      name: service.provider,
    } : ORGANIZATION,
    serviceType: service.serviceType,
    category: "Mental Health Services",
    areaServed: service.areaServed || {
      "@type": "Country", 
      name: "United States",
    },
  };
}

/**
 * Generate Review structured data
 */
function generateReviewStructuredData(review: {
  rating: number;
  reviewBody?: string;
  authorName: string;
  datePublished: string;
  itemReviewed: {
    name: string;
    type: string;
  };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.reviewBody,
    author: {
      "@type": "Person",
      name: review.authorName,
    },
    datePublished: review.datePublished,
    itemReviewed: {
      "@type": review.itemReviewed.type,
      name: review.itemReviewed.name,
    },
  };
}

/**
 * Generate FAQPage structured data
 */
function generateFAQPageStructuredData(faqs: Array<{
  question: string;
  answer: string;
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList structured data
 */
function generateBreadcrumbListStructuredData(breadcrumbs: Array<{
  name: string;
  url: string;
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith("http") ? crumb.url : `${SITE_CONFIG.url}${crumb.url}`,
    })),
  };
}

/**
 * Helper to combine multiple structured data objects
 */
export function combineStructuredData(dataObjects: Record<string, any>[]): Record<string, any> {
  if (dataObjects.length === 1) {
    return dataObjects[0];
  }

  return {
    "@context": "https://schema.org",
    "@graph": dataObjects,
  };
}

/**
 * Generate comprehensive structured data for the homepage
 */
export function generateHomepageStructuredData() {
  return combineStructuredData([
    generateStructuredData("WebSite", {}),
    generateStructuredData("Organization", {}),
    generateStructuredData("MedicalOrganization", {}),
  ]);
}