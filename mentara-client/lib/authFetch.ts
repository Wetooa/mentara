export async function authFetch(url: string, options?: RequestInit) {
  const cookies = typeof document !== "undefined" ? document.cookie : "";

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
    ...options,
    headers: {
      ...(options?.headers || {}),
      Cookie: cookies, // Forward all cookies
    },
    credentials: "include", // This ensures cookies are sent with the request
  });
  return res.json();
}
