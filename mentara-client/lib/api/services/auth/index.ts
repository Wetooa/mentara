// Role-specific auth services
export {
  createClientAuthService,
  type ClientAuthService,
  type ClientLoginDto,
  type ClientRegisterDto,
  type ClientAuthResponse,
  type ClientUser,
} from "./clientAuth";

export {
  createTherapistAuthService,
  type TherapistAuthService,
  type TherapistLoginDto,
  type TherapistAuthResponse,
  type TherapistUser,
} from "./therapistAuth";

export {
  createAdminAuthService,
  type AdminAuthService,
  type AdminLoginDto,
  type AdminAuthResponse,
  type AdminUser,
} from "./adminAuth";

export {
  createModeratorAuthService,
  type ModeratorAuthService,
  type ModeratorLoginDto,
  type ModeratorAuthResponse,
  type ModeratorUser,
} from "./moderatorAuth";

// Shared auth functionality
export {
  createSharedAuthService,
  type SharedAuthService,
  type SharedRefreshTokenDto,
  type PasswordResetDto,
  type PasswordResetConfirmDto,
  type EmailVerificationDto,
  type TokenPair,
  type PasswordResetResponse,
  type EmailVerificationResponse,
} from "./sharedAuth";

// Unified auth service factory
import { AxiosInstance } from "axios";
import { createClientAuthService } from "./clientAuth";
import { createTherapistAuthService } from "./therapistAuth";
import { createAdminAuthService } from "./adminAuth";
import { createModeratorAuthService } from "./moderatorAuth";
import { createSharedAuthService } from "./sharedAuth";

export const createRoleBasedAuthService = (client: AxiosInstance) => ({
  client: createClientAuthService(client),
  therapist: createTherapistAuthService(client),
  admin: createAdminAuthService(client),
  moderator: createModeratorAuthService(client),
  shared: createSharedAuthService(client),
});

export type RoleBasedAuthService = ReturnType<typeof createRoleBasedAuthService>;

// Alias for backward compatibility
export { createRoleBasedAuthService as createAuthService };
export type { RoleBasedAuthService as AuthService };