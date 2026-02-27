import type { UserRole } from '@/types/database';

export function getPrimaryRole(roles: UserRole[]): UserRole {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('coach')) return 'coach';
  return 'parent';
}

export function hasRole(roles: UserRole[], role: UserRole): boolean {
  return roles.includes(role);
}
