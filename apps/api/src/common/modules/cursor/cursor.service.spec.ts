import { CursorService } from './cursor.service';

describe('CursorService.createPaginationResponse', () => {
  it('maps each row once and reuses it for edges and nodes', () => {
    const mapper = jest.fn((item: { id: string }) => ({ mapped: item.id }));
    const res = new CursorService().createPaginationResponse(
      [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      2,
      3,
      mapper
    );
    expect(mapper).toHaveBeenCalledTimes(2);
    expect(res.nodes).toEqual([{ mapped: 'a' }, { mapped: 'b' }]);
    expect(res.edges.map((e) => e.node)).toEqual(res.nodes);
  });
});
