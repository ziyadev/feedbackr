'use client';
import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { DataTablePagination } from '@/components/ui/data-table/DataTablePagination';
import { client } from '@/services/admin-client';
import { columns } from './columns';
import { Filterbar } from './DataTableFilterbar';

const PAGE_SIZE = 20;

export default function FeedbackTable() {
  // cursors[i] is the cursor used to fetch page i (page 0 has none)
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
  const page = cursors.length - 1;
  const { data, previousData } = client.feedback.getAll.useQuery({
    variables: { pagination: { take: PAGE_SIZE, cursor: cursors[page] } },
  });
  const current = data ?? previousData;
  const endCursor = current?.getFeedbacks.endCursor;
  if (!current) return 'loading...';
  return (
    <div className="space-y-3 ">
      <Filterbar />
      <DataTable data={current.getFeedbacks.nodes ?? []} columns={columns} />
      <DataTablePagination
        pageSize={PAGE_SIZE}
        hasPrevious={page > 0}
        hasNext={!!current.getFeedbacks.hasNextPage}
        onFirst={() => setCursors([undefined])}
        onPrevious={() => setCursors((c) => c.slice(0, -1))}
        onNext={() => endCursor && setCursors((c) => [...c, endCursor])}
      />
    </div>
  );
}
