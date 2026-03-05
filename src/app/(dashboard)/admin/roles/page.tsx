'use client';

import { useRoles } from '@/hooks/useRoles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Shield } from 'lucide-react';

export default function RolesPage() {
  const { data: roles, isLoading } = useRoles();

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Roles & Permissions</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {roles?.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {role.name}
                </CardTitle>
                <div className="flex gap-1">
                  <Badge variant="outline">{role.scope}</Badge>
                  {role.isDefault && <Badge variant="info">Default</Badge>}
                </div>
              </div>
              {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {role.permissions.length} permissions{role._count?.memberRoles !== undefined ? ` | ${role._count.memberRoles} members` : ''}
              </p>
              <div className="flex flex-wrap gap-1">
                {role.permissions.map((perm) => (
                  <span key={perm.id} className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                    {perm.permission}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
