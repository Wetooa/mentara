import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as emailjs from '@emailjs/nodejs';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const publicKey = this.configService.get<string>('EMAILJS_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('EMAILJS_PRIVATE_KEY');

    if (publicKey && privateKey) {
      emailjs.init({
        publicKey,
        privateKey,
      });
    } else {
      this.logger.warn('EmailJS credentials are not fully configured. Email sending might fail.');
    }
  }

  /**
   * Sends an email using EmailJS
   * @param templateParams Object containing template variables
   * @param serviceId Optional service ID (defaults to config)
   * @param templateId Optional template ID (defaults to config)
   */
  async sendEmail(
    templateParams: Record<string, unknown>,
    serviceId?: string,
    templateId?: string,
  ) {
    const sId = serviceId || this.configService.get<string>('EMAILJS_SERVICE_ID');
    const tId = templateId || this.configService.get<string>('EMAILJS_TEMPLATE_ID');

    if (!sId || !tId) {
      this.logger.error('Service ID or Template ID is missing');
      throw new Error('EmailJS configuration error: missing Service ID or Template ID');
    }

    try {
      const response = await emailjs.send(sId, tId, templateParams);
      this.logger.log(`Email sent successfully: ${response.status} ${response.text}`);
      return response;
    } catch (error) {
      this.logger.error('Failed to send email via EmailJS', error);
      throw error;
    }
  }
}
