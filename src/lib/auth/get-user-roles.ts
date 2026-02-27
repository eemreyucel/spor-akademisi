import { createServerSupabaseClient } from '@/lib/supabase/server'

export type UserRole = 'admin' | 'coach' | 'parent'

export interface UserProfile {
  id: string
  fullName: string
  email: string
  roles: UserRole[]
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('user_id', user.id)
    .single()

  if (!profile) return null

  const { data: roles } = await supabase
    .from('profile_roles')
    .select('role')
    .eq('profile_id', profile.id)

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email ?? '',
    roles: (roles ?? []).map(r => r.role as UserRole),
  }
}
