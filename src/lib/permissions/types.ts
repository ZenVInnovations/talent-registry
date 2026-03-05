export type PermissionContext = 'global' | 'employer' | 'resource';
export type PermissionRequirement = 'authenticated' | 'member' | 'public';

export interface PermissionDefinition {
  name: string;
  module: string;
  action: string;
  description: string;
  contexts: PermissionContext[];
  require: PermissionRequirement;
  grantToAdmin: boolean;
  dependencies: string[];
  visible: boolean;
}

export interface UserContext {
  id: string;
  email?: string;
}
