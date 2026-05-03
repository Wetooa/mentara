import { normalizeApiBaseURL } from './custom-instance';

describe('normalizeApiBaseURL', () => {
  it('appends /api when missing', () => {
    expect(normalizeApiBaseURL('http://localhost:10000')).toBe('http://localhost:10000/api');
  });

  it('preserves base that already ends with /api', () => {
    expect(normalizeApiBaseURL('http://localhost:10000/api')).toBe('http://localhost:10000/api');
  });

  it('strips trailing slash before normalizing', () => {
    expect(normalizeApiBaseURL('http://localhost:10000/')).toBe('http://localhost:10000/api');
  });
});
