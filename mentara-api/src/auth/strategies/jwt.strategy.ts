import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../providers/prisma-client.provider';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
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
      throw new UnauthorizedException('User not found or deactivated');
    }

    // Verify role matches
    if (user.role !== payload.role) {
      throw new UnauthorizedException('Role mismatch - please re-authenticate');
    }

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