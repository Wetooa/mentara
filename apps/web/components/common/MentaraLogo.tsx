"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MentaraLogoProps {
  href?: string;
  className?: string;
  variant?: "icon" | "landscape";
  width?: number;
  height?: number;
  showGradient?: boolean;
}

export function MentaraLogo({
  href = "/about",
  className,
  variant = "landscape",
  width,
  height,
  showGradient = true,
}: MentaraLogoProps) {
  const iconWidth = width || (variant === "icon" ? 32 : 250);
  const iconHeight = height || (variant === "icon" ? 32 : 100);
  const iconSrc =
    variant === "icon"
      ? "/icons/mentara/mentara-icon.png"
      : "/icons/mentara/mentara-landscape.png";

  const logoContent = (
    <div
      className={cn(
        "relative group transition-all duration-300",
        showGradient &&
          "hover:scale-105 cursor-pointer rounded-lg p-2 hover:bg-gradient-to-br hover:from-secondary/10 hover:to-secondary/5",
        className
      )}
    >
      <Image
        src={iconSrc}
        alt="Mentara logo"
        width={iconWidth}
        height={iconHeight}
        className={cn(
          "transition-all duration-300",
          showGradient && "group-hover:opacity-90"
        )}
        priority
      />
      {showGradient && (
        <>
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-secondary/20 to-transparent rounded-lg pointer-events-none" />
          {/* Subtle glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-secondary/5 rounded-lg blur-sm pointer-events-none" />
        </>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Go to about page">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

