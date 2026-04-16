import { Metadata } from "next";
import { generateRoleMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateRoleMetadata("client");

export default function ClientCommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}