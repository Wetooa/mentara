import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../providers/prisma-client.provider';
import { JwtPayload } from '../strategies/jwt.strategy';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface RefreshTokenData {
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async generateTokenPair(
    userId: string,
    email: string,
    role: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    const refreshToken = await this.generateRefreshToken(
      userId,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken: refreshToken.token,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    };
  }

  private async generateRefreshToken(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshTokenData> {
    // Generate cryptographically secure random token
    const token = crypto.randomBytes(64).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + 
      parseInt(process.env.JWT_REFRESH_EXPIRES_IN?.replace('d', '') || '7')
    );

    // Store hashed token in database
    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    return {
      token,
      userId,
      expiresAt,
      ipAddress,
      userAgent,
    };
  }

  async refreshAccessToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (storedToken.user.deactivatedAt) {
      throw new UnauthorizedException('User account deactivated');
    }

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new token pair
    return this.generateTokenPair(
      storedToken.userId,
      storedToken.user.email,
      storedToken.user.role,
      ipAddress,
      userAgent,
    );
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await this.prisma.refreshToken.updateMany({
      where: { 
        token: hashedToken,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { 
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
  }

  // Password hashing utilities
  async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Email verification token generation
  async generateEmailVerificationToken(): Promise<{ token: string; hashedToken: string; expiresAt: Date }> {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    return { token, hashedToken, expiresAt };
  }

  // Password reset token generation
  async generatePasswordResetToken(): Promise<{ token: string; hashedToken: string; expiresAt: Date }> {
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
          failedLoginCount: 0 
        },
      });
    }

    return false;
  }

  async handleFailedLogin(userId: string): Promise<void> {
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
    const lockoutDuration = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15');

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
}