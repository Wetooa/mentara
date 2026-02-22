/**
 * Demo/login config for Phase 2 "Your Matches" demo.
 * Only active when NODE_ENV === 'development' or NEXT_PUBLIC_ENABLE_DEMO_LOGIN is set.
 */

const DEMO_ENABLED =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true";

const DEMO_CLIENT_EMAIL =
  process.env.NEXT_PUBLIC_DEMO_CLIENT_EMAIL || "client3@mentaratest.dev";
const DEMO_CLIENT_PASSWORD =
  process.env.NEXT_PUBLIC_DEMO_CLIENT_PASSWORD || "password123";

export function getDemoLoginConfig(): {
  enabled: boolean;
  email: string;
  password: string;
} {
  return {
    enabled: DEMO_ENABLED,
    email: DEMO_CLIENT_EMAIL,
    password: DEMO_CLIENT_PASSWORD,
  };
}
