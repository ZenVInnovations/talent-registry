'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Configure system-wide settings for the Talent Registry</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            System settings are managed via environment variables. Contact an administrator to modify configuration.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>External service connections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">ZenYa Skill Matching</p>
              <p className="text-xs text-muted-foreground">AI-powered skill assessment and matching</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Connected</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Flutto (ZenCube)</p>
              <p className="text-xs text-muted-foreground">User and project data sync</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Connected</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">NATS Event Streaming</p>
              <p className="text-xs text-muted-foreground">Real-time event bus</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Connected</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
