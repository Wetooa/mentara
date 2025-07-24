import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { LoadingBarProvider } from "@/components/providers/LoadingBarProvider";
import { generatePageMetadata, SITE_CONFIG, generateHomepageStructuredData } from "@/lib/metadata";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [SITE_CONFIG.author],
  creator: SITE_CONFIG.creator,
  publisher: SITE_CONFIG.publisher,
  category: SITE_CONFIG.category,
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
    startupImage: [
      {
        url: "/startup/apple-touch-startup-image-768x1004.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
      {
        url: "/startup/apple-touch-startup-image-1536x2008.png", 
        media: "(device-width: 1536px) and (device-height: 2048px)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: SITE_CONFIG.url,
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
  other: {
    "theme-color": SITE_CONFIG.themeColor,
    "msapplication-TileColor": SITE_CONFIG.themeColor,
    "msapplication-config": "/favicon/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = generateHomepageStructuredData();

  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`font-[Futura] antialiased min-h-screen min-w-screen h-screen w-screen`}
      >
        <QueryProvider>
          <AuthProvider>
            <WebSocketProvider namespace="/messaging" autoConnect={true}>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                forcedTheme="light"
                storageKey="mentara-theme"
                disableTransitionOnChange
              >
                <LoadingBarProvider
                  showLoadingBar={true}
                  loadingBarProps={{
                    height: 4,
                    color: 'green',
                    position: 'top',
                    showPercentage: false,
                    minimumDuration: 300,
                  }}
                >
                  {children}
                </LoadingBarProvider>
                <Toaster />
              </ThemeProvider>
            </WebSocketProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
