'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui.store';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getNavForRoles } from './sidebar-nav-items';
import { X, ChevronLeft } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const { roles } = useCurrentUser();
  const navSections = getNavForRoles(roles);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300 lg:static lg:z-auto',
          sidebarCollapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="text-lg font-bold text-primary">
              ZenCube
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 hover:bg-accent lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={toggleSidebarCollapsed}
            className="hidden rounded-md p-1 hover:bg-accent lg:block"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={cn('h-5 w-5 transition-transform', sidebarCollapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              {!sidebarCollapsed && (
                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                          sidebarCollapsed && 'justify-center px-2',
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
