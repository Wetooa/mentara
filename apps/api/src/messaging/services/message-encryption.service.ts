import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface EncryptedMessage {
  encryptedContent: string;
  iv: string;
  authTag: string;
  keyId: string; // For key rotation
}

export interface DecryptedMessage {
  content: string;
  decryptedAt: Date;
}

@Injectable()
export class MessageEncryptionService {
  private readonly logger = new Logger(MessageEncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits

  // In production, these should be loaded from secure key management service
  private readonly encryptionKeys = new Map<string, Buffer>();

  constructor() {
    this.initializeKeys();
  }

  /**
   * Initialize encryption keys for different conversation types
   * In production, integrate with AWS KMS, HashiCorp Vault, or similar
   */
  private initializeKeys() {
    // Master key from environment (should be in secure key management)
    const masterKeyHex =
      process.env.MESSAGE_ENCRYPTION_KEY ||
      crypto.randomBytes(this.keyLength).toString('hex');

    // Derive keys for different conversation types
    this.encryptionKeys.set('default', Buffer.from(masterKeyHex, 'hex'));

    // Therapy conversations get their own key for extra security
    const therapyKey = this.deriveKey(masterKeyHex, 'therapy-conversations');
    this.encryptionKeys.set('therapy', therapyKey);

    // Support conversations
    const supportKey = this.deriveKey(masterKeyHex, 'support-conversations');
    this.encryptionKeys.set('support', supportKey);

    this.logger.log('Message encryption keys initialized');
  }

  /**
   * Derive a key from master key using PBKDF2
   */
  private deriveKey(masterKey: string, salt: string): Buffer {
    return crypto.pbkdf2Sync(masterKey, salt, 100000, this.keyLength, 'sha512');
  }

  /**
   * Encrypt a message with AES-256-GCM
   */
  async encryptMessage(
    content: string,
    conversationType: 'therapy' | 'support' | 'default' = 'default',
  ): Promise<EncryptedMessage> {
    try {
      const key =
        this.encryptionKeys.get(conversationType) ||
        this.encryptionKeys.get('default')!;

      // Generate random IV for each message
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      // Encrypt the content
      let encrypted = cipher.update(content, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      const result: EncryptedMessage = {
        encryptedContent: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        keyId: conversationType,
      };

      this.logger.debug(
        `Message encrypted with ${conversationType} key (length: ${content.length} chars)`,
      );

      return result;
    } catch (error) {
      this.logger.error('Message encryption failed:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  /**
   * Decrypt a message with AES-256-GCM
   */
  async decryptMessage(
    encryptedMessage: EncryptedMessage,
  ): Promise<DecryptedMessage> {
    try {
      const { encryptedContent, iv, authTag, keyId } = encryptedMessage;

      const key =
        this.encryptionKeys.get(keyId) || this.encryptionKeys.get('default')!;

      // Create decipher
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        key,
        Buffer.from(iv, 'hex'),
      );

      // Set auth tag
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      // Decrypt the content
      let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      this.logger.debug(
        `Message decrypted with ${keyId} key (length: ${decrypted.length} chars)`,
      );

      return {
        content: decrypted,
        decryptedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Message decryption failed:', error);
      throw new Error('Failed to decrypt message - content may be corrupted');
    }
  }

  /**
   * Determine conversation type for encryption key selection
   */
  getConversationType(
    conversationParticipants: { role: string }[],
  ): 'therapy' | 'support' | 'default' {
    const hasTherapist = conversationParticipants.some(
      (p) => p.role === 'therapist',
    );
    const hasClient = conversationParticipants.some((p) => p.role === 'client');
    const hasModerator = conversationParticipants.some(
      (p) => p.role === 'moderator',
    );

    if (hasTherapist && hasClient) {
      return 'therapy'; // Therapeutic conversations need highest security
    }

    if (hasModerator) {
      return 'support'; // Support conversations
    }

    return 'default'; // Regular user conversations
  }

  /**
   * Rotate encryption keys (for security maintenance)
   */
  async rotateKeys(): Promise<void> {
    this.logger.warn(
      'Key rotation not implemented - should integrate with secure key management service',
    );
    // TODO: Implement key rotation with proper key management service
    // 1. Generate new keys
    // 2. Re-encrypt recent messages with new keys
    // 3. Update key references
    // 4. Schedule old key cleanup
  }

  /**
   * Validate encrypted message integrity
   */
  async validateMessageIntegrity(
    encryptedMessage: EncryptedMessage,
  ): Promise<boolean> {
    try {
      await this.decryptMessage(encryptedMessage);
      return true;
    } catch (error) {
      this.logger.warn('Message integrity validation failed:', error);
      return false;
    }
  }

  /**
   * Batch encrypt multiple messages (for migration or bulk operations)
   */
  async batchEncryptMessages(
    messages: {
      content: string;
      conversationType?: 'therapy' | 'support' | 'default';
    }[],
  ): Promise<EncryptedMessage[]> {
    const results: EncryptedMessage[] = [];

    for (const message of messages) {
      try {
        const encrypted = await this.encryptMessage(
          message.content,
          message.conversationType || 'default',
        );
        results.push(encrypted);
      } catch (error) {
        this.logger.error('Batch encryption failed for message:', error);
        // Continue with other messages, don't fail the entire batch
        results.push({
          encryptedContent: '',
          iv: '',
          authTag: '',
          keyId: 'failed',
        });
      }
    }

    this.logger.log(`Batch encrypted ${results.length} messages`);
    return results;
  }

  /**
   * Check if encryption is properly configured
   */
  isEncryptionAvailable(): boolean {
    return this.encryptionKeys.size > 0 && this.encryptionKeys.has('default');
  }

  /**
   * Get encryption status for monitoring
   */
  getEncryptionStatus() {
    return {
      algorithm: this.algorithm,
      keyCount: this.encryptionKeys.size,
      availableKeyTypes: Array.from(this.encryptionKeys.keys()),
      isConfigured: this.isEncryptionAvailable(),
    };
  }
}
