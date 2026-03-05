'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api/profiles';
import { TalentCard } from '@/components/employer/talent-card';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';

const domains = [
  'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
  'Cloud Computing', 'Cybersecurity', 'DevOps', 'UI/UX Design',
];

export default function TalentBrowsePage() {
  const [domain, setDomain] = useState('');
  const [skills, setSkills] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['profiles', { domain, skills, page }],
    queryFn: () => profilesApi.list({ domain: domain || undefined, skills: skills || undefined, page, limit: 12 }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Talent</h1>
        <p className="text-muted-foreground">Discover skilled candidates for your positions</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          placeholder="Search by skills..."
          value={skills}
          onChange={(e) => { setSkills(e.target.value); setPage(1); }}
          onClear={() => setSkills('')}
          className="sm:max-w-sm"
        />
        <Select
          placeholder="All Domains"
          value={domain}
          onChange={(e) => { setDomain(e.target.value); setPage(1); }}
          options={domains.map((d) => ({ value: d, label: d }))}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !data?.data.length ? (
        <EmptyState icon={Users} title="No profiles found" description="Try different filters." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((p) => <TalentCard key={p.id} profile={p} />)}
          </div>
          <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} className="justify-center" />
        </>
      )}
    </div>
  );
}
