import { FeedbackService } from './feedback.service';

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
