import { queryKeys } from './queryKeys';

describe('queryKeys', () => {
  it('exposes stable therapist namespace keys', () => {
    expect(queryKeys.therapists.all).toEqual(['therapists']);
    expect(queryKeys.therapist.all).toEqual(['therapist']);
  });

  it('uses factory functions where defined', () => {
    expect(queryKeys.client.recommendations).toEqual([
      'client',
      'recommendations',
    ]);
    expect(queryKeys.client.assignedTherapist()).toEqual([
      'client',
      'assignedTherapist',
    ]);
  });
});
