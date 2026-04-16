import { Injectable, Logger } from '@nestjs/common';

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface WebRTCConfig {
  iceServers: IceServer[];
  iceCandidatePoolSize?: number;
}

@Injectable()
export class WebRTCConfigService {
  private readonly logger = new Logger(WebRTCConfigService.name);

  /**
   * Get WebRTC configuration with TURN/STUN servers
   */
  getWebRTCConfig(): WebRTCConfig {
    const iceServers: IceServer[] = [];

    // Add STUN servers (always available)
    iceServers.push(
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    );

    // Add TURN servers from environment variables
    const turnServers = this.getTURNServers();
    if (turnServers.length > 0) {
      iceServers.push(...turnServers);
      this.logger.log(`Configured ${turnServers.length} TURN server(s)`);
    } else {
      this.logger.warn('No TURN servers configured - WebRTC may not work behind firewalls/NATs');
    }

    return {
      iceServers,
      iceCandidatePoolSize: 10,
    };
  }

  /**
   * Get TURN servers from environment variables
   * Supports multiple providers: Twilio, Xirsys, custom
   */
  private getTURNServers(): IceServer[] {
    const turnServers: IceServer[] = [];

    // Twilio TURN servers
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilioUrl = process.env.TWILIO_TURN_SERVER_URL || 'turn:global.turn.twilio.com:3478';
      const username = process.env.TWILIO_ACCOUNT_SID;
      const credential = process.env.TWILIO_AUTH_TOKEN;

      turnServers.push({
        urls: twilioUrl,
        username,
        credential,
      });

      this.logger.debug('Twilio TURN server configured');
    }

    // Xirsys TURN servers
    if (process.env.XIRSYS_TURN_SERVER_URL && process.env.XIRSYS_USERNAME && process.env.XIRSYS_CREDENTIAL) {
      turnServers.push({
        urls: process.env.XIRSYS_TURN_SERVER_URL,
        username: process.env.XIRSYS_USERNAME,
        credential: process.env.XIRSYS_CREDENTIAL,
      });

      this.logger.debug('Xirsys TURN server configured');
    }

    // Custom TURN server
    if (process.env.TURN_SERVER_URL) {
      const turnServer: IceServer = {
        urls: process.env.TURN_SERVER_URL,
      };

      if (process.env.TURN_USERNAME) {
        turnServer.username = process.env.TURN_USERNAME;
      }

      if (process.env.TURN_PASSWORD) {
        turnServer.credential = process.env.TURN_PASSWORD;
      }

      turnServers.push(turnServer);
      this.logger.debug('Custom TURN server configured');
    }

    return turnServers;
  }

  /**
   * Validate WebRTC configuration
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.getWebRTCConfig();

    if (config.iceServers.length === 0) {
      errors.push('No ICE servers configured');
    }

    // Check if we have at least one TURN server
    const hasTURN = config.iceServers.some(
      (server) =>
        typeof server.urls === 'string'
          ? server.urls.startsWith('turn:')
          : server.urls.some((url) => typeof url === 'string' && url.startsWith('turn:')),
    );

    if (!hasTURN) {
      errors.push('No TURN servers configured - WebRTC may fail behind firewalls/NATs');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

