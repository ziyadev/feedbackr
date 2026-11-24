import { NotFoundException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CursorService } from '@/common/modules/cursor/cursor.service';

describe('FeedbackService.handleGetAllFeedbacks', () => {
  const setup = (rowCount: number) => {
    const rows = Array.from({ length: rowCount }, (_, i) => ({
      id: `r${i}`,
      workspaceId: 'w1',
      metadata: '{}',
      userMetadata: '{}',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const findMany = jest.fn().mockResolvedValue(rows);
    const count = jest.fn().mockResolvedValue(rowCount);
    const service = new FeedbackService(
      { findMany, count } as any,
      new CursorService()
    );
    return { service, findMany };
  };

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

  it('passes cursor through when orderBy is omitted', async () => {
    const { service, findMany } = setup(3);

    await service.handleGetAllFeedbacks(
      'w1',
      null as any,
      { take: 5, cursor: 'f9' },
      null as any
    );

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 6,
        cursor: { id: 'f9' },
        skip: 1,
        orderBy: { createdAt: 'desc' },
      })
    );
  });

  it('does not let defaults override explicit take and orderBy', async () => {
    const { service, findMany } = setup(3);

    await service.handleGetAllFeedbacks('w1', null as any, { take: 2 }, {
      key: 'rating',
      type: 'asc',
    } as any);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 3, orderBy: { rating: 'asc' } })
    );
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

describe('FeedbackService.handleUpdateFeedback', () => {
  const row = {
    id: 'f1',
    workspaceId: 'w1',
    status: 'closed',
    priority: 'high',
    assignedToId: 'm1',
    metadata: '{}',
    userMetadata: '{}',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('updates status, priority and assignee in the caller workspace', async () => {
    const findFirst = jest.fn().mockResolvedValue(row);
    const update = jest.fn().mockResolvedValue(row);
    const service = new FeedbackService(
      { findFirst, update } as any,
      new CursorService()
    );

    const result = await service.handleUpdateFeedback('w1', 'f1', {
      status: 'closed',
      priority: 'high',
      assignedToId: 'm1',
    } as any);

    expect(findFirst).toHaveBeenCalledWith({
      where: { id: 'f1', workspaceId: 'w1' },
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: 'f1' },
      data: { status: 'closed', priority: 'high', assignedToId: 'm1' },
    });
    expect(result.status).toBe('closed');
  });

  it('rejects feedback from another workspace without updating', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const update = jest.fn();
    const service = new FeedbackService(
      { findFirst, update } as any,
      new CursorService()
    );

    await expect(
      service.handleUpdateFeedback('w2', 'f1', { status: 'closed' } as any)
    ).rejects.toThrow(NotFoundException);
    expect(update).not.toHaveBeenCalled();
  });
});
