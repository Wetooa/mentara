import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingBarProvider } from "@/components/providers/LoadingBarProvider";

export const metadata: Metadata = {
  title: "Mentara",
  description: "Telehealth platform for mental health",
  icons: {
    icon: [
      {
        url: "/favicon/favicon.ico",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={`font-[Futura] antialiased min-h-screen min-w-screen h-screen w-screen`}
      >
        <QueryProvider>
          <AuthProvider>
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
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
