import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../providers/prisma-client.provider';
import { JwtPayload } from '../strategies/jwt.strategy';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export interface SimpleToken {
  token: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async generateToken(
    userId: string,
    email: string,
    role: string,
  ): Promise<SimpleToken> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    // Generate non-expiring token for simplicity
    const token = this.jwtService.sign(payload);

    return { token };
  }

  // Removed refresh token generation - no longer needed

  // Removed refresh token functionality - no longer needed

  // Simple logout - no complex token management needed
  async logout(userId: string): Promise<void> {
    // With non-expiring tokens, we could implement a blacklist if needed
    // For now, just update last login to track activity
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  // Password hashing utilities
  async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Email verification token generation
  async generateEmailVerificationToken(): Promise<{
    token: string;
    hashedToken: string;
    expiresAt: Date;
  }> {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    return { token, hashedToken, expiresAt };
  }

  // Password reset token generation
  async generatePasswordResetToken(): Promise<{
    token: string;
    hashedToken: string;
    expiresAt: Date;
  }> {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry for security

    return { token, hashedToken, expiresAt };
  }

  // Account lockout utilities
  async checkAccountLockout(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lockoutUntil: true, failedLoginCount: true },
    });

    if (!user) return false;

    // Check if account is currently locked
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      return true;
    }

    // Clear lockout if time has passed
    if (user.lockoutUntil && user.lockoutUntil <= new Date()) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          lockoutUntil: null,
          failedLoginCount: 0,
        },
      });
    }

    return false;
  }

  async handleFailedLogin(userId: string): Promise<void> {
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
    const lockoutDuration = parseInt(
      process.env.LOCKOUT_DURATION_MINUTES || '15',
    );

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { failedLoginCount: true },
    });

    if (!user) return;

    const newFailedCount = user.failedLoginCount + 1;
    const updateData: any = { failedLoginCount: newFailedCount };

    // Lock account if max attempts reached
    if (newFailedCount >= maxAttempts) {
      const lockoutUntil = new Date();
      lockoutUntil.setMinutes(lockoutUntil.getMinutes() + lockoutDuration);
      updateData.lockoutUntil = lockoutUntil;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async resetFailedLoginCount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginCount: 0,
        lockoutUntil: null,
        lastLoginAt: new Date(),
      },
    });
  }

  /**
   * Validates a JWT token and returns the payload (simplified - no expiration)
   * @param token - The JWT token to validate
   * @returns Promise with validation result
   */
  async validateToken(token: string): Promise<{
    valid: boolean;
    payload?: any;
    error?: string;
  }> {
    try {
      // Verify and decode the token (no expiration check since we're using non-expiring tokens)
      const payload = this.jwtService.verify(token);

      return {
        valid: true,
        payload,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid token',
      };
    }
  }

  // Removed all session management - no longer needed with single tokens

  // Removed helper methods - no longer needed with simplified approach
}
