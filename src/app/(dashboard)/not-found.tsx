import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-bold">Page Not Found</h2>
      <p className="mt-2 text-sm text-muted-foreground">The page you are looking for does not exist.</p>
      <Link href="/dashboard" className="mt-6">
        <Button variant="outline">Go to Dashboard</Button>
      </Link>
    </div>
  );
}
