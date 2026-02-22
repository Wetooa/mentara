import { Metadata } from "next";
import { generateRoleMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateRoleMetadata("therapist");

export default function TherapistCommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}