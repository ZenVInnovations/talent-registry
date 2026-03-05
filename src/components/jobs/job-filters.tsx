'use client';

import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { FilterBar, FilterChip } from '@/components/ui/filter-bar';
import { JOB_TYPE_LABELS } from '@/lib/constants';

interface JobFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  domain: string;
  onDomainChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  onClearAll: () => void;
}

const domains = [
  'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
  'Cloud Computing', 'Cybersecurity', 'DevOps', 'UI/UX Design',
];

export function JobFilters({ search, onSearchChange, domain, onDomainChange, type, onTypeChange, onClearAll }: JobFiltersProps) {
  const hasFilters = domain || type;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          className="sm:max-w-sm"
        />
        <Select
          placeholder="All Domains"
          value={domain}
          onChange={(e) => onDomainChange(e.target.value)}
          options={domains.map((d) => ({ value: d, label: d }))}
        />
        <Select
          placeholder="All Types"
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          options={Object.entries(JOB_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
        />
      </div>
      {hasFilters && (
        <FilterBar>
          {domain && <FilterChip label="Domain" value={domain} onRemove={() => onDomainChange('')} />}
          {type && <FilterChip label="Type" value={JOB_TYPE_LABELS[type] || type} onRemove={() => onTypeChange('')} />}
          <button onClick={onClearAll} className="text-xs text-muted-foreground hover:text-foreground">Clear all</button>
        </FilterBar>
      )}
    </div>
  );
}
