import { Metadata } from "next";
import { generatePageMetadata, SITE_CONFIG } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Mental Health Community - Connect & Support",
  description: "Join thousands in our safe, supportive mental health community. Connect with others who understand your journey, share experiences, and find peer support in moderated discussion groups.",
  keywords: [
    "mental health community",
    "peer support",
    "support groups", 
    "mental wellness community",
    "online therapy community",
    "depression support",
    "anxiety support", 
    "community forums",
    "mental health discussions",
    "safe space",
    "moderated community",
    "mental health peer connections",
    "wellness support network"
  ],
  image: "/og/community-hero.png",
  url: "/community",
  type: "website",
});

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}