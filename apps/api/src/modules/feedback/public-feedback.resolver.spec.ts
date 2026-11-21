import 'reflect-metadata';
import { PublicFeedbackResolver } from './public-feedback.resolver';

describe('PublicFeedbackResolver', () => {
  it('delegates createFeedback to the service', async () => {
    const handleCreateFeedback = jest.fn().mockResolvedValue({ id: 'f1' });
    const resolver = new PublicFeedbackResolver({
      handleCreateFeedback,
    } as any);
    const input = { workspaceId: 'w1', comment: 'hi', pageUrl: 'https://a.b' };
    await expect(resolver.createFeedback(input)).resolves.toEqual({ id: 'f1' });
    expect(handleCreateFeedback).toHaveBeenCalledWith(input);
  });

  it('is public (no auth guard applied)', () => {
    expect(
      Reflect.getMetadata('__guards__', PublicFeedbackResolver)
    ).toBeUndefined();
  });
});
