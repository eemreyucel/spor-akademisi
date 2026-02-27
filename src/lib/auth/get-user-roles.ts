import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

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

  let { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('user_id', user.id)
    .single()

  // Auto-create profile if missing (trigger was removed for RLS compatibility)
  if (!profile) {
    const serviceClient = createServiceRoleClient()
    const fullName = user.user_metadata?.full_name || user.email || ''
    const { data: newProfile } = await serviceClient
      .from('profiles')
      .insert({ user_id: user.id, full_name: fullName, email: user.email })
      .select('id, full_name, email')
      .single()

    if (!newProfile) return null
    profile = newProfile
  }

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
