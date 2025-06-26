import { auth } from "@clerk/nextjs/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function authFetch(url: string, options?: RequestInit) {
  let token: string | null = null;

  // Get token based on environment (server vs client)
  if (typeof window === "undefined") {
    // Server-side: use auth from Clerk
    try {
      const { getToken } = await auth();
      token = await getToken();
    } catch (error) {
      console.warn("Failed to get server-side token:", error);
    }
  } else {
    // Client-side: get token from Clerk's client-side auth
    if (typeof window !== "undefined" && (window as any).Clerk?.session) {
      try {
        token = await (window as any).Clerk.session.getToken();
      } catch (error) {
        console.warn("Failed to get client-side token:", error);
      }
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  // Add Authorization header if token is available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}
