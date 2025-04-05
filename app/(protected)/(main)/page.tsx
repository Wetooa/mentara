"use client";
import {
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user } = useUser();

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 py-4 border-b">
          <h1 className="text-2xl font-bold">My App</h1>

          <div className="flex items-center gap-4">
            <SignedIn>
              {/* This content only shows if the user is signed in */}
              <div className="flex items-center gap-4">
                <span className="text-sm">
                  Welcome, {user?.firstName || user?.username || "there"}
                </span>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>

            <SignedOut>
              {/* This content only shows if the user is signed out */}
              <SignInButton mode="modal">
                <Button variant="outline">Sign In</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </header>

        <section className="py-8">
          <h2 className="text-3xl font-bold mb-6">Welcome to Your Dashboard</h2>

          <SignedIn>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-4">Your Content</h3>
              <p className="text-gray-600 mb-4">
                You're now signed in to the application. This content is only
                visible to authenticated users.
              </p>
              <Button
                variant="secondary"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Go to Dashboard
              </Button>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-4">Get Started</h3>
              <p className="text-gray-600 mb-4">
                Sign in to access your personalized dashboard and features.
              </p>
              <SignInButton mode="modal">
                <Button>Sign In to Continue</Button>
              </SignInButton>
            </div>
          </SignedOut>
        </section>
      </div>
    </main>
  );
}
