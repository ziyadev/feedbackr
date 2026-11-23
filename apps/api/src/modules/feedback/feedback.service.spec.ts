import { FeedbackService } from './feedback.service';
import { CursorService } from '@/common/modules/cursor/cursor.service';

describe('FeedbackService.handleGetAllFeedbacks', () => {
  it('works when pagination and orderBy are omitted', async () => {
    const rows = Array.from({ length: 11 }, (_, i) => ({
      id: `f${i}`,
      workspaceId: 'w1',
      metadata: '{}',
      userMetadata: '{}',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const findMany = jest.fn().mockResolvedValue(rows);
    const count = jest.fn().mockResolvedValue(11);
    const service = new FeedbackService(
      { findMany, count } as any,
      new CursorService()
    );

    const result = await service.handleGetAllFeedbacks(
      'w1',
      null as any,
      null as any,
      null as any
    );

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 11, orderBy: { createdAt: 'desc' } })
    );
    expect(result.nodes).toHaveLength(10);
    expect(result.hasNextPage).toBe(true);
  });
});

describe('FeedbackService.handleCreateFeedback', () => {
  it('creates a feedback via the repository and returns the mapped model', async () => {
    const now = new Date();
    const create = jest.fn().mockResolvedValue({
      id: 'f1',
      workspaceId: 'w1',
      metadata: '{}',
      userMetadata: '{}',
      rating: 5,
      type: 'bug',
      comment: 'broken',
      priority: 'low',
      status: 'open',
      pageUrl: 'https://x.test/a',
      country: 'unknown',
      summary: null,
      createdAt: now,
      updatedAt: now,
    });
    const service = new FeedbackService({ create } as any, {} as any);

    const result = await service.handleCreateFeedback({
      workspaceId: 'w1',
      comment: 'broken',
      rating: 5,
      type: 'bug' as any,
      pageUrl: 'https://x.test/a',
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workspaceId: 'w1',
        comment: 'broken',
        country: 'unknown',
      }),
    });
    expect(result.id).toBe('f1');
    expect(result.metadata).toEqual([]);
  });
});
