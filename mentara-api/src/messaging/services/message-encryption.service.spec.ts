import { Test, TestingModule } from '@nestjs/testing';
import { MessageEncryptionService, EncryptedMessage, DecryptedMessage } from './message-encryption.service';
import { Logger } from '@nestjs/common';
import * as crypto from 'crypto';

describe('MessageEncryptionService', () => {
  let service: MessageEncryptionService;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    // Save original environment
    originalEnv = process.env;

    // Set a test encryption key
    process.env.MESSAGE_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageEncryptionService],
    }).compile();

    service = module.get<MessageEncryptionService>(MessageEncryptionService);
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Service Initialization', () => {
    it('should initialize encryption keys on construction', () => {
      expect(service.isEncryptionAvailable()).toBe(true);
      
      const status = service.getEncryptionStatus();
      expect(status.keyCount).toBe(3);
      expect(status.availableKeyTypes).toEqual(['default', 'therapy', 'support']);
      expect(status.algorithm).toBe('aes-256-gcm');
      expect(status.isConfigured).toBe(true);
    });

    it('should initialize with random key when no environment key is set', () => {
      delete process.env.MESSAGE_ENCRYPTION_KEY;
      
      // Create a new service instance
      const newService = new MessageEncryptionService();
      
      expect(newService.isEncryptionAvailable()).toBe(true);
      expect(newService.getEncryptionStatus().keyCount).toBe(3);
    });

    it('should log successful key initialization', () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      
      // Create a new service instance to trigger initialization
      new MessageEncryptionService();
      
      expect(loggerSpy).toHaveBeenCalledWith('Message encryption keys initialized');
    });
  });

  describe('encryptMessage', () => {
    it('should encrypt a message with default key', async () => {
      const testMessage = 'Hello, this is a test message';
      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');
      
      const encrypted = await service.encryptMessage(testMessage);
      
      expect(encrypted).toBeDefined();
      expect(encrypted.encryptedContent).toBeTruthy();
      expect(encrypted.iv).toBeTruthy();
      expect(encrypted.authTag).toBeTruthy();
      expect(encrypted.keyId).toBe('default');
      expect(encrypted.encryptedContent).not.toBe(testMessage);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Message encrypted with default key (length: ${testMessage.length} chars)`
      );
    });

    it('should encrypt a message with therapy key', async () => {
      const testMessage = 'Confidential therapy session notes';
      
      const encrypted = await service.encryptMessage(testMessage, 'therapy');
      
      expect(encrypted.keyId).toBe('therapy');
      expect(encrypted.encryptedContent).toBeTruthy();
      expect(encrypted.iv).toBeTruthy();
      expect(encrypted.authTag).toBeTruthy();
    });

    it('should encrypt a message with support key', async () => {
      const testMessage = 'Support conversation content';
      
      const encrypted = await service.encryptMessage(testMessage, 'support');
      
      expect(encrypted.keyId).toBe('support');
      expect(encrypted.encryptedContent).toBeTruthy();
      expect(encrypted.iv).toBeTruthy();
      expect(encrypted.authTag).toBeTruthy();
    });

    it('should use default key when invalid conversation type is provided', async () => {
      const testMessage = 'Test message';
      
      const encrypted = await service.encryptMessage(testMessage, 'invalid' as any);
      
      expect(encrypted.keyId).toBe('invalid');
      expect(encrypted.encryptedContent).toBeTruthy();
    });

    it('should generate unique IV for each encryption', async () => {
      const testMessage = 'Same message content';
      
      const encrypted1 = await service.encryptMessage(testMessage);
      const encrypted2 = await service.encryptMessage(testMessage);
      
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.encryptedContent).not.toBe(encrypted2.encryptedContent);
      expect(encrypted1.authTag).not.toBe(encrypted2.authTag);
    });

    it('should encrypt empty string', async () => {
      const encrypted = await service.encryptMessage('');
      
      expect(encrypted).toBeDefined();
      expect(encrypted.encryptedContent).toBeTruthy();
      expect(encrypted.iv).toBeTruthy();
      expect(encrypted.authTag).toBeTruthy();
    });

    it('should encrypt very long messages', async () => {
      const longMessage = 'A'.repeat(10000);
      
      const encrypted = await service.encryptMessage(longMessage);
      
      expect(encrypted).toBeDefined();
      expect(encrypted.encryptedContent).toBeTruthy();
      expect(encrypted.iv).toBeTruthy();
      expect(encrypted.authTag).toBeTruthy();
    });

    it('should encrypt unicode characters', async () => {
      const unicodeMessage = 'Test 🚀 emoji and special chars: äöü ñ 中文';
      
      const encrypted = await service.encryptMessage(unicodeMessage);
      
      expect(encrypted).toBeDefined();
      expect(encrypted.encryptedContent).toBeTruthy();
    });

    it('should handle encryption errors gracefully', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      
      // Mock crypto.createCipheriv to throw an error
      const originalCreateCipheriv = crypto.createCipheriv;
      jest.spyOn(crypto, 'createCipheriv').mockImplementation(() => {
        throw new Error('Crypto error');
      });
      
      await expect(service.encryptMessage('test')).rejects.toThrow('Failed to encrypt message');
      expect(loggerSpy).toHaveBeenCalledWith('Message encryption failed:', expect.any(Error));
      
      // Restore the original function
      crypto.createCipheriv = originalCreateCipheriv;
    });
  });

  describe('decryptMessage', () => {
    it('should decrypt a message encrypted with default key', async () => {
      const testMessage = 'Hello, this is a test message';
      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');
      
      const encrypted = await service.encryptMessage(testMessage);
      const decrypted = await service.decryptMessage(encrypted);
      
      expect(decrypted.content).toBe(testMessage);
      expect(decrypted.decryptedAt).toBeInstanceOf(Date);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Message decrypted with default key (length: ${testMessage.length} chars)`
      );
    });

    it('should decrypt a message encrypted with therapy key', async () => {
      const testMessage = 'Confidential therapy session notes';
      
      const encrypted = await service.encryptMessage(testMessage, 'therapy');
      const decrypted = await service.decryptMessage(encrypted);
      
      expect(decrypted.content).toBe(testMessage);
      expect(decrypted.decryptedAt).toBeInstanceOf(Date);
    });

    it('should decrypt a message encrypted with support key', async () => {
      const testMessage = 'Support conversation content';
      
      const encrypted = await service.encryptMessage(testMessage, 'support');
      const decrypted = await service.decryptMessage(encrypted);
      
      expect(decrypted.content).toBe(testMessage);
      expect(decrypted.decryptedAt).toBeInstanceOf(Date);
    });

    it('should decrypt empty string', async () => {
      const encrypted = await service.encryptMessage('');
      const decrypted = await service.decryptMessage(encrypted);
      
      expect(decrypted.content).toBe('');
      expect(decrypted.decryptedAt).toBeInstanceOf(Date);
    });

    it('should decrypt very long messages', async () => {
      const longMessage = 'A'.repeat(10000);
      
      const encrypted = await service.encryptMessage(longMessage);
      const decrypted = await service.decryptMessage(encrypted);
      
      expect(decrypted.content).toBe(longMessage);
    });

    it('should decrypt unicode characters', async () => {
      const unicodeMessage = 'Test 🚀 emoji and special chars: äöü ñ 中文';
      
      const encrypted = await service.encryptMessage(unicodeMessage);
      const decrypted = await service.decryptMessage(encrypted);
      
      expect(decrypted.content).toBe(unicodeMessage);
    });

    it('should fail to decrypt with tampered encrypted content', async () => {
      const testMessage = 'Test message';
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      
      const encrypted = await service.encryptMessage(testMessage);
      // Tamper with the encrypted content
      encrypted.encryptedContent = encrypted.encryptedContent.slice(0, -2) + '00';
      
      await expect(service.decryptMessage(encrypted)).rejects.toThrow('Failed to decrypt message - content may be corrupted');
      expect(loggerSpy).toHaveBeenCalledWith('Message decryption failed:', expect.any(Error));
    });

    it('should fail to decrypt with tampered IV', async () => {
      const testMessage = 'Test message';
      
      const encrypted = await service.encryptMessage(testMessage);
      // Tamper with the IV
      encrypted.iv = encrypted.iv.slice(0, -2) + '00';
      
      await expect(service.decryptMessage(encrypted)).rejects.toThrow('Failed to decrypt message - content may be corrupted');
    });

    it('should fail to decrypt with tampered auth tag', async () => {
      const testMessage = 'Test message';
      
      const encrypted = await service.encryptMessage(testMessage);
      // Tamper with the auth tag
      encrypted.authTag = encrypted.authTag.slice(0, -2) + '00';
      
      await expect(service.decryptMessage(encrypted)).rejects.toThrow('Failed to decrypt message - content may be corrupted');
    });

    it('should use default key when keyId is not found', async () => {
      const testMessage = 'Test message';
      
      const encrypted = await service.encryptMessage(testMessage);
      // Use a non-existent key ID
      encrypted.keyId = 'nonexistent';
      
      const decrypted = await service.decryptMessage(encrypted);
      expect(decrypted.content).toBe(testMessage);
    });

    it('should fail to decrypt with invalid hex values', async () => {
      const invalidEncrypted: EncryptedMessage = {
        encryptedContent: 'invalid-hex',
        iv: 'invalid-hex',
        authTag: 'invalid-hex',
        keyId: 'default',
      };
      
      await expect(service.decryptMessage(invalidEncrypted)).rejects.toThrow('Failed to decrypt message - content may be corrupted');
    });
  });

  describe('getConversationType', () => {
    it('should return therapy for therapist-client conversations', () => {
      const participants = [
        { role: 'therapist' },
        { role: 'client' }
      ];
      
      const type = service.getConversationType(participants);
      expect(type).toBe('therapy');
    });

    it('should return therapy for conversations with therapist, client, and others', () => {
      const participants = [
        { role: 'therapist' },
        { role: 'client' },
        { role: 'moderator' }
      ];
      
      const type = service.getConversationType(participants);
      expect(type).toBe('therapy');
    });

    it('should return support for conversations with moderator (but no therapy)', () => {
      const participants = [
        { role: 'moderator' },
        { role: 'client' }
      ];
      
      const type = service.getConversationType(participants);
      expect(type).toBe('support');
    });

    it('should return support for conversations with only moderator', () => {
      const participants = [
        { role: 'moderator' }
      ];
      
      const type = service.getConversationType(participants);
      expect(type).toBe('support');
    });

    it('should return default for regular user conversations', () => {
      const participants = [
        { role: 'client' },
        { role: 'client' }
      ];
      
      const type = service.getConversationType(participants);
      expect(type).toBe('default');
    });

    it('should return default for conversations with unknown roles', () => {
      const participants = [
        { role: 'unknown' },
        { role: 'other' }
      ];
      
      const type = service.getConversationType(participants);
      expect(type).toBe('default');
    });

    it('should return default for empty participants array', () => {
      const participants: { role: string }[] = [];
      
      const type = service.getConversationType(participants);
      expect(type).toBe('default');
    });
  });

  describe('validateMessageIntegrity', () => {
    it('should validate integrity of valid encrypted message', async () => {
      const testMessage = 'Test message for integrity validation';
      
      const encrypted = await service.encryptMessage(testMessage);
      const isValid = await service.validateMessageIntegrity(encrypted);
      
      expect(isValid).toBe(true);
    });

    it('should detect tampered encrypted content', async () => {
      const testMessage = 'Test message';
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');
      
      const encrypted = await service.encryptMessage(testMessage);
      // Tamper with the encrypted content
      encrypted.encryptedContent = encrypted.encryptedContent.slice(0, -2) + '00';
      
      const isValid = await service.validateMessageIntegrity(encrypted);
      
      expect(isValid).toBe(false);
      expect(loggerSpy).toHaveBeenCalledWith('Message integrity validation failed:', expect.any(Error));
    });

    it('should detect tampered IV', async () => {
      const testMessage = 'Test message';
      
      const encrypted = await service.encryptMessage(testMessage);
      // Tamper with the IV
      encrypted.iv = encrypted.iv.slice(0, -2) + '00';
      
      const isValid = await service.validateMessageIntegrity(encrypted);
      expect(isValid).toBe(false);
    });

    it('should detect tampered auth tag', async () => {
      const testMessage = 'Test message';
      
      const encrypted = await service.encryptMessage(testMessage);
      // Tamper with the auth tag
      encrypted.authTag = encrypted.authTag.slice(0, -2) + '00';
      
      const isValid = await service.validateMessageIntegrity(encrypted);
      expect(isValid).toBe(false);
    });

    it('should handle invalid hex values gracefully', async () => {
      const invalidEncrypted: EncryptedMessage = {
        encryptedContent: 'invalid-hex',
        iv: 'invalid-hex',
        authTag: 'invalid-hex',
        keyId: 'default',
      };
      
      const isValid = await service.validateMessageIntegrity(invalidEncrypted);
      expect(isValid).toBe(false);
    });
  });

  describe('batchEncryptMessages', () => {
    it('should encrypt multiple messages successfully', async () => {
      const messages = [
        { content: 'Message 1' },
        { content: 'Message 2', conversationType: 'therapy' as const },
        { content: 'Message 3', conversationType: 'support' as const },
      ];
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      
      const results = await service.batchEncryptMessages(messages);
      
      expect(results).toHaveLength(3);
      expect(results[0].keyId).toBe('default');
      expect(results[1].keyId).toBe('therapy');
      expect(results[2].keyId).toBe('support');
      expect(results.every(r => r.encryptedContent !== '')).toBe(true);
      expect(loggerSpy).toHaveBeenCalledWith('Batch encrypted 3 messages');
    });

    it('should handle empty messages array', async () => {
      const messages: { content: string; conversationType?: 'therapy' | 'support' | 'default' }[] = [];
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      
      const results = await service.batchEncryptMessages(messages);
      
      expect(results).toHaveLength(0);
      expect(loggerSpy).toHaveBeenCalledWith('Batch encrypted 0 messages');
    });

    it('should handle encryption failures gracefully', async () => {
      const messages = [
        { content: 'Valid message' },
        { content: 'Message that will fail' },
      ];
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      
      // Mock the service to fail on the second message
      const originalEncrypt = service.encryptMessage;
      jest.spyOn(service, 'encryptMessage').mockImplementation(async (content, type) => {
        if (content === 'Message that will fail') {
          throw new Error('Encryption failed');
        }
        return originalEncrypt.call(service, content, type);
      });
      
      const results = await service.batchEncryptMessages(messages);
      
      expect(results).toHaveLength(2);
      expect(results[0].encryptedContent).toBeTruthy();
      expect(results[1].encryptedContent).toBe('');
      expect(results[1].keyId).toBe('failed');
      expect(loggerSpy).toHaveBeenCalledWith('Batch encryption failed for message:', expect.any(Error));
    });

    it('should continue processing after individual failures', async () => {
      const messages = [
        { content: 'Message 1' },
        { content: 'Failing message' },
        { content: 'Message 3' },
      ];
      
      // Mock the service to fail on the middle message
      const originalEncrypt = service.encryptMessage;
      jest.spyOn(service, 'encryptMessage').mockImplementation(async (content, type) => {
        if (content === 'Failing message') {
          throw new Error('Encryption failed');
        }
        return originalEncrypt.call(service, content, type);
      });
      
      const results = await service.batchEncryptMessages(messages);
      
      expect(results).toHaveLength(3);
      expect(results[0].encryptedContent).toBeTruthy();
      expect(results[1].encryptedContent).toBe('');
      expect(results[2].encryptedContent).toBeTruthy();
    });

    it('should handle very large batch sizes', async () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({
        content: `Message ${i}`,
        conversationType: (i % 3 === 0 ? 'therapy' : i % 3 === 1 ? 'support' : 'default') as const,
      }));
      
      const results = await service.batchEncryptMessages(messages);
      
      expect(results).toHaveLength(100);
      expect(results.every(r => r.encryptedContent !== '')).toBe(true);
    });
  });

  describe('rotateKeys', () => {
    it('should log warning for unimplemented key rotation', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');
      
      await service.rotateKeys();
      
      expect(loggerSpy).toHaveBeenCalledWith(
        'Key rotation not implemented - should integrate with secure key management service'
      );
    });

    it('should not throw error when called', async () => {
      await expect(service.rotateKeys()).resolves.not.toThrow();
    });
  });

  describe('isEncryptionAvailable', () => {
    it('should return true when encryption is properly configured', () => {
      expect(service.isEncryptionAvailable()).toBe(true);
    });

    it('should return false when no keys are available', () => {
      // Create a service with no keys by mocking the initialization
      const mockService = Object.create(MessageEncryptionService.prototype);
      mockService.encryptionKeys = new Map();
      
      expect(mockService.isEncryptionAvailable()).toBe(false);
    });

    it('should return false when default key is missing', () => {
      // Create a service with keys but no default key
      const mockService = Object.create(MessageEncryptionService.prototype);
      mockService.encryptionKeys = new Map([['therapy', Buffer.from('test')]]);
      
      expect(mockService.isEncryptionAvailable()).toBe(false);
    });
  });

  describe('getEncryptionStatus', () => {
    it('should return correct encryption status', () => {
      const status = service.getEncryptionStatus();
      
      expect(status).toEqual({
        algorithm: 'aes-256-gcm',
        keyCount: 3,
        availableKeyTypes: ['default', 'therapy', 'support'],
        isConfigured: true,
      });
    });

    it('should reflect changes in key availability', () => {
      // Create a service with no keys
      const mockService = Object.create(MessageEncryptionService.prototype);
      mockService.encryptionKeys = new Map();
      mockService.algorithm = 'aes-256-gcm';
      
      const status = mockService.getEncryptionStatus();
      
      expect(status).toEqual({
        algorithm: 'aes-256-gcm',
        keyCount: 0,
        availableKeyTypes: [],
        isConfigured: false,
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle full encryption-decryption cycle with all key types', async () => {
      const testMessage = 'Integration test message';
      const keyTypes: ('default' | 'therapy' | 'support')[] = ['default', 'therapy', 'support'];
      
      for (const keyType of keyTypes) {
        const encrypted = await service.encryptMessage(testMessage, keyType);
        const decrypted = await service.decryptMessage(encrypted);
        
        expect(decrypted.content).toBe(testMessage);
        expect(encrypted.keyId).toBe(keyType);
      }
    });

    it('should handle concurrent encryption and decryption operations', async () => {
      const testMessages = Array.from({ length: 10 }, (_, i) => `Message ${i}`);
      
      // Encrypt all messages concurrently
      const encryptPromises = testMessages.map(msg => service.encryptMessage(msg));
      const encryptedMessages = await Promise.all(encryptPromises);
      
      // Decrypt all messages concurrently
      const decryptPromises = encryptedMessages.map(msg => service.decryptMessage(msg));
      const decryptedMessages = await Promise.all(decryptPromises);
      
      // Verify all messages were correctly decrypted
      decryptedMessages.forEach((decrypted, i) => {
        expect(decrypted.content).toBe(testMessages[i]);
      });
    });

    it('should maintain data integrity across multiple operations', async () => {
      const testMessage = 'Integrity test message';
      
      // Encrypt the same message multiple times
      const encrypted1 = await service.encryptMessage(testMessage);
      const encrypted2 = await service.encryptMessage(testMessage);
      
      // Decrypt both messages
      const decrypted1 = await service.decryptMessage(encrypted1);
      const decrypted2 = await service.decryptMessage(encrypted2);
      
      // Both should decrypt to the same content
      expect(decrypted1.content).toBe(testMessage);
      expect(decrypted2.content).toBe(testMessage);
      
      // But encrypted forms should be different (due to different IVs)
      expect(encrypted1.encryptedContent).not.toBe(encrypted2.encryptedContent);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });
  });
});