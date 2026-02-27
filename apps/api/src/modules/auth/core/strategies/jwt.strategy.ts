import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../../core/prisma/prisma.service';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret-key',
    });
    
    // Log JWT configuration (without exposing secret)
    this.logger.log(`JWT Strategy initialized with secret key: ${process.env.JWT_SECRET ? '***configured***' : '⚠️ using fallback-secret-key (NOT SECURE)'}`);
  }

  async validate(payload: JwtPayload) {
    // Debug log removed to reduce noise
    
    // Check if payload has required fields
    if (!payload.sub || !payload.email || !payload.role) {
      this.logger.warn(`Invalid JWT payload structure: missing required fields`, {
        hasSub: !!payload.sub,
        hasEmail: !!payload.email,
        hasRole: !!payload.role,
      });
      throw new UnauthorizedException('Invalid token payload');
    }

    // Verify user still exists and is active
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
        deactivatedAt: null, // Ensure user is not deactivated
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        client: true,
        therapist: true,
      },
    });

    if (!user) {
      this.logger.warn(`User not found or deactivated: ${payload.sub}`);
      throw new UnauthorizedException('User not found or deactivated');
    }

    // Verify role matches
    if (user.role !== payload.role) {
      this.logger.warn(`Role mismatch for user ${payload.sub}: token role=${payload.role}, db role=${user.role}`);
      throw new UnauthorizedException('Role mismatch - please re-authenticate');
    }

    // Verify email matches (additional security check)
    if (user.email !== payload.email) {
      this.logger.warn(`Email mismatch for user ${payload.sub}: token email=${payload.email}, db email=${user.email}`);
      throw new UnauthorizedException('Token email mismatch - please re-authenticate');
    }

    // Debug log removed to reduce noise
    
    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      client: user.client,
      therapist: user.therapist,
    };
  }
}
