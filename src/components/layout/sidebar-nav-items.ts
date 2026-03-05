import {
  LayoutDashboard, Briefcase, FileText, User, Bell, Building2, Users, BarChart3,
  Shield, Settings, ClipboardList, CheckSquare, Database, FolderKanban,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  roles?: string[];
  children?: NavItem[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const studentNav: NavSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Jobs', href: '/jobs', icon: Briefcase },
      { label: 'Applications', href: '/applications', icon: FileText },
      { label: 'Placements', href: '/placements', icon: CheckSquare },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile', href: '/profile', icon: User },
      { label: 'Consent', href: '/profile/consent', icon: Shield },
      { label: 'Notifications', href: '/notifications', icon: Bell },
    ],
  },
];

export const employerNav: NavSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/employer', icon: LayoutDashboard },
      { label: 'Jobs', href: '/employer/jobs', icon: Briefcase },
      { label: 'Talent', href: '/employer/talent', icon: Users },
      { label: 'Placements', href: '/employer/placements', icon: CheckSquare },
    ],
  },
  {
    label: 'Company',
    items: [
      { label: 'Settings', href: '/employer/settings', icon: Building2 },
    ],
  },
];

export const bdNav: NavSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Employers', href: '/admin/employers', icon: Building2 },
      { label: 'Verification', href: '/admin/employers/verification', icon: ClipboardList },
      { label: 'Jobs', href: '/admin/jobs', icon: Briefcase },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
];

export const adminNav: NavSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Employers', href: '/admin/employers', icon: Building2 },
      { label: 'Verification', href: '/admin/employers/verification', icon: ClipboardList },
      { label: 'Jobs', href: '/admin/jobs', icon: Briefcase },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Audit Trail', href: '/admin/audit', icon: FolderKanban },
      { label: 'Retention', href: '/admin/retention', icon: Database },
      { label: 'Roles', href: '/admin/roles', icon: Shield },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function getNavForRoles(roles: string[]): NavSection[] {
  if (roles.includes('ZENV_ADMIN')) return adminNav;
  if (roles.includes('ZENV_BD')) return bdNav;
  if (roles.includes('EMPLOYER')) return [...employerNav];
  return studentNav;
}
