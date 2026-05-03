import emailjs from '@emailjs/nodejs';

jest.mock('@emailjs/nodejs', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    send: jest.fn(),
  },
}));

import { EmailService } from './email.service';

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.EMAILJS_PUBLIC_KEY;
  });

  it('should construct without throwing when EmailJS is not configured', () => {
    expect(() => new EmailService()).not.toThrow();
    expect(emailjs.init).not.toHaveBeenCalled();
  });

  it('calls EmailJS init when public key is set', () => {
    process.env.EMAILJS_PUBLIC_KEY = 'test-public';
    new EmailService();
    expect(emailjs.init).toHaveBeenCalled();
  });
});
