import emailjs from '@emailjs/nodejs';
import { env } from '../../../../test/stubs/private-env';

jest.mock('@emailjs/nodejs', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    send: jest.fn(),
  },
}));

describe('POST /api/submit-demo', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    Object.keys(env).forEach((key) => delete env[key]);
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('rejects invalid email addresses', async () => {
    const { POST } = await import('./+server');

    const response = await POST({
      request: new Request('http://localhost/api/submit-demo', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Ava',
          lastName: 'Stone',
          companyName: 'Mentara',
          email: 'not-an-email',
        }),
      }),
    } as any);

    await expect(response.json()).resolves.toEqual({
      success: false,
      message: 'Invalid email format',
    });
    expect(response.status).toBe(400);
  });

  it('returns a configuration error when EmailJS is missing', async () => {
    env.NODE_ENV = 'production';

    const { POST } = await import('./+server');

    const response = await POST({
      request: new Request('http://localhost/api/submit-demo', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Ava',
          lastName: 'Stone',
          companyName: 'Mentara',
          email: 'ava@example.com',
        }),
      }),
    } as any);

    await expect(response.json()).resolves.toEqual({
      success: false,
      message: 'Email service is not configured. Please contact support.',
    });
    expect(response.status).toBe(500);
    expect(emailjs.init).not.toHaveBeenCalled();
  });
});
