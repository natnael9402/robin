'use client';

import { type ReactNode, useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { SkeletonTable } from './Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  loading?: boolean;
  emptyState?: ReactNode;
  emptyStateIcon?: ReactNode;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  className?: string;
  footer?: ReactNode;
  onRowClick?: (row: T, index: number) => void;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyState = 'No data available',
  emptyStateIcon,
  striped = true,
  hoverable = true,
  bordered = true,
  className,
  footer,
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return <SkeletonTable rows={5} columns={columns.length} />;
  }

  if (data.length === 0) {
    return (
      <div className={cn('glass rounded-2xl border border-glass-border shadow-glass', className)}>
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          {emptyStateIcon && <div className="mb-3 text-zinc-300 dark:text-zinc-700">{emptyStateIcon}</div>}
          <p className="text-muted-foreground">{emptyState}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('glass rounded-2xl border border-glass-border shadow-glass overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-hover/60 border-b border-border-light backdrop-blur-sm">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-xs',
                    column.headerClassName
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn('divide-y', bordered && 'divide-border-light')}>
            {data.map((row, rowIndex) => (
              <tr
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                className={cn(
                  'transition-colors',
                  hoverable && 'hover:bg-surface-hover',
                  striped && rowIndex % 2 === 1 && 'bg-surface-hover/50',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-6 py-4', column.className)}
                  >
                    {column.render(row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-border-light bg-surface-hover/50">
          {footer}
        </div>
      )}
    </div>
  );
}

export interface SimpleTableProps {
  headers: string[];
  rows: (string | number | ReactNode)[][];
  keyExtractor?: (row: (string | number | ReactNode)[], index: number) => string | number;
  loading?: boolean;
  emptyState?: ReactNode;
  className?: string;
  cellClassName?: (colIndex: number) => string;
}

export function SimpleTable({
  headers,
  rows,
  keyExtractor = (_, i) => i as string | number,
  loading = false,
  emptyState = 'No data available',
  className,
  cellClassName,
}: SimpleTableProps) {
  const columns = useMemo(
    () =>
      headers.map((header, idx) => ({
        key: header.toLowerCase().replace(/\s+/g, '-'),
        header,
        render: () => rows[idx]?.[idx] ?? '',
        className: cellClassName?.(idx),
      })),
    [headers, cellClassName]
  );

  const data = useMemo(() => rows.map((_, i) => i), [rows]);

  return (
    <Table
      columns={columns}
      data={data}
      keyExtractor={keyExtractor as any}
      loading={loading}
      emptyState={emptyState}
      className={className}
    />
  );
}