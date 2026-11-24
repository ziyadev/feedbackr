'use client';
import { cx } from '@/lib/utils';
import { Button } from '@feedbacker/ui';
import {
  RiArrowLeftDoubleLine,
  RiArrowLeftSLine,
  RiArrowRightDoubleLine,
  RiArrowRightSLine,
} from '@remixicon/react';

interface DataTablePaginationProps {
  pageSize: number;
  onFirst?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function DataTablePagination({
  pageSize,
  onFirst,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: DataTablePaginationProps) {
  const paginationButtons = [
    {
      icon: RiArrowLeftDoubleLine,
      onClick: () => onFirst?.(),
      disabled: !hasPrevious,
      srText: 'First page',
      mobileView: 'hidden sm:block',
    },
    {
      icon: RiArrowLeftSLine,
      onClick: () => onPrevious?.(),
      disabled: !hasPrevious,
      srText: 'Previous page',
      mobileView: '',
    },
    {
      icon: RiArrowRightSLine,
      onClick: () => onNext?.(),
      disabled: !hasNext,
      srText: 'Next page',
      mobileView: '',
    },
    {
      icon: RiArrowRightDoubleLine,
      onClick: () => true,
      disabled: true,
      srText: 'Last page',
      mobileView: 'hidden sm:block',
    },
  ];

  const totalRows = 10;
  const currentPage = 1;
  const firstRowIndex = currentPage * pageSize + 1;
  const lastRowIndex = Math.min(totalRows, firstRowIndex + pageSize - 1);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm tabular-nums text-gray-500">
        {10} of {totalRows} row(s) selected.
      </div>
      <div className="flex items-center gap-x-6 lg:gap-x-8">
        <p className="hidden text-sm tabular-nums text-gray-500 sm:block">
          Showing{' '}
          <span className="font-medium text-gray-900 dark:text-gray-50">
            {firstRowIndex}-{lastRowIndex}
          </span>{' '}
          of{' '}
          <span className="font-medium text-gray-900 dark:text-gray-50">
            {totalRows}
          </span>
        </p>
        <div className="flex items-center gap-x-1.5">
          {paginationButtons.map((button, index) => (
            <Button
              key={index}
              variant="secondary"
              className={cx(button.mobileView, 'p-1.5')}
              onClick={() => {
                button.onClick();
              }}
              disabled={button.disabled}
            >
              <span className="sr-only">{button.srText}</span>
              <button.icon className="size-4 shrink-0" aria-hidden="true" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
