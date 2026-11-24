import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import { FeedbackResolver } from './feedback.resolver';
import { FeedbackService } from './feedback.service';
import { WorkspaceMemberRole } from '../workspace/model/workspace-member.model';

const row = {
  id: 'f1',
  workspaceId: 'w1',
  metadata: '{}',
  userMetadata: '{}',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('FeedbackResolver.updateFeedback', () => {
  it('is restricted to ADMIN', () => {
    const roles = Reflect.getMetadata(
      'roles',
      FeedbackResolver.prototype.updateFeedback
    );
    expect(roles).toEqual([WorkspaceMemberRole.ADMIN]);
  });

  it('delegates to the service with the workspace id', async () => {
    const handleUpdateFeedback = jest.fn().mockResolvedValue({ id: 'f1' });
    const resolver = new FeedbackResolver({ handleUpdateFeedback } as any);
    await resolver.updateFeedback({ id: 'w1' } as any, 'f1', {
      status: 'closed',
    } as any);
    expect(handleUpdateFeedback).toHaveBeenCalledWith('w1', 'f1', {
      status: 'closed',
    });
  });
});

describe('FeedbackService.handleUpdateFeedback', () => {
  const setup = (found: any, member: any = { id: 'm1' }) => {
    const findFirst = jest.fn().mockResolvedValue(found);
    const update = jest.fn().mockResolvedValue({ ...row, status: 'closed' });
    const memberFindFirst = jest.fn().mockResolvedValue(member);
    const service = new FeedbackService(
      { findFirst, update } as any,
      {} as any,
      { findFirst: memberFindFirst } as any
    );
    return { service, findFirst, update, memberFindFirst };
  };

  it('throws NotFound when feedback is not in the workspace', async () => {
    const { service, update } = setup(null);
    await expect(
      service.handleUpdateFeedback('w1', 'f1', { status: 'closed' } as any)
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(update).not.toHaveBeenCalled();
  });

  it('updates only the provided fields, scoped to the workspace', async () => {
    const { service, findFirst, update } = setup(row);
    await service.handleUpdateFeedback('w1', 'f1', {
      status: 'closed',
    } as any);
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: 'f1', workspaceId: 'w1' },
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: 'f1' },
      data: { status: 'closed' },
    });
  });

  it('rejects an assignee from another workspace', async () => {
    const { service, update, memberFindFirst } = setup(row, null);
    await expect(
      service.handleUpdateFeedback('w1', 'f1', { assignedToId: 'm9' } as any)
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(memberFindFirst).toHaveBeenCalledWith({
      where: { id: 'm9', workspaceId: 'w1' },
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('allows unassigning with null', async () => {
    const { service, update } = setup(row);
    await service.handleUpdateFeedback('w1', 'f1', {
      assignedToId: null,
    } as any);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'f1' },
      data: { assignedToId: null },
    });
  });
});
