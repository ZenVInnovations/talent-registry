'use client';

import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUIStore } from '@/stores/ui.store';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownItem } from '@/components/ui/dropdown-menu';
import { Menu, Sun, Moon, Monitor, LogOut, User, Bell } from 'lucide-react';
import Link from 'next/link';

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let path = '';
  for (const segment of segments) {
    path += `/${segment}`;
    crumbs.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: path,
    });
  }
  return crumbs;
}

export function Topbar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { toggleSidebar, theme, setTheme } = useUIStore();
  const breadcrumbs = getBreadcrumbs(pathname);

  const themeIcons = { light: Sun, dark: Moon, system: Monitor };
  const nextTheme = { light: 'dark', dark: 'system', system: 'light' } as const;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-2 hover:bg-accent lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="hidden items-center gap-1 text-sm sm:flex" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <span className="text-muted-foreground">/</span>}
              {i === breadcrumbs.length - 1 ? (
                <span className="font-medium">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(nextTheme[theme])}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={`Switch to ${nextTheme[theme]} theme`}
        >
          {(() => { const Icon = themeIcons[theme]; return <Icon className="h-5 w-5" />; })()}
        </button>

        <Link
          href="/notifications"
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Link>

        <DropdownMenu
          trigger={
            <button className="flex items-center gap-2 rounded-md p-1.5 hover:bg-accent">
              <Avatar name={user?.name || 'User'} src={user?.image} size="sm" />
              <span className="hidden text-sm font-medium sm:block">{user?.name}</span>
            </button>
          }
        >
          <DropdownItem onClick={() => window.location.href = '/profile'}>
            <User className="mr-2 h-4 w-4" /> Profile
          </DropdownItem>
          <DropdownItem destructive onClick={() => signOut({ callbackUrl: '/login' })}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </DropdownItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
