import { FeedbackMapper } from './feedback.mapper';

describe('FeedbackMapper', () => {
  describe('toModel', () => {
    const now = new Date();
    const makeEntity = (overrides: Record<string, unknown> = {}) =>
      ({
        id: 'f1',
        workspaceId: 'w1',
        metadata: '{}',
        userMetadata: '{}',
        rating: 5,
        type: 'BUG',
        comment: 'c',
        priority: 'LOW',
        status: 'OPEN',
        pageUrl: 'https://x.test',
        country: 'unknown',
        summary: null,
        createdAt: now,
        updatedAt: now,
        ...overrides,
      } as any);

    it('parses metadata and userMetadata JSON into key/value lists', () => {
      const model = FeedbackMapper.toModel(
        makeEntity({
          metadata: '{"browser":"chrome","os":"linux"}',
          userMetadata: '{"plan":"pro"}',
        })
      );
      expect(model.metadata).toEqual([
        { key: 'browser', value: 'chrome' },
        { key: 'os', value: 'linux' },
      ]);
      expect(model.userMetadata).toEqual([{ key: 'plan', value: 'pro' }]);
    });

    it('returns empty lists for empty JSON objects', () => {
      const model = FeedbackMapper.toModel(makeEntity());
      expect(model.metadata).toEqual([]);
      expect(model.userMetadata).toEqual([]);
    });

    it('keeps a null rating as null', () => {
      expect(
        FeedbackMapper.toModel(makeEntity({ rating: null })).rating
      ).toBeNull();
    });

    it('passes country through, including the "unknown" default set on create', () => {
      expect(FeedbackMapper.toModel(makeEntity()).country).toBe('unknown');
      expect(
        FeedbackMapper.toModel(makeEntity({ country: 'DE' })).country
      ).toBe('DE');
    });
  });
});
