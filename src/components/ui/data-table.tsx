'use client';

import { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: string;
}

export function DataTable<T extends Record<string, unknown>>({ data, columns, keyField }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key} className={cn(col.className)}>
              {col.sortable ? (
                <button onClick={() => handleSort(col.key)} className="inline-flex items-center gap-1 hover:text-foreground">
                  {col.label}
                  {sortKey === col.key ? (
                    sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronsUpDown className="h-3 w-3 opacity-50" />
                  )}
                </button>
              ) : (
                col.label
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((item) => (
          <TableRow key={String(item[keyField])}>
            {columns.map((col) => (
              <TableCell key={col.key} className={cn(col.className)}>
                {col.render ? col.render(item) : String(item[col.key] ?? '')}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
