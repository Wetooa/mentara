"use client";

import { AdminSignIn } from "@/components/auth/admin";

export default function AdminSignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Administrative access to the Mentara platform
          </p>
        </div>
        <AdminSignIn />
      </div>
    </div>
  );
}