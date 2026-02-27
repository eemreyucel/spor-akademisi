import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { data: roles } = await supabase
    .from('profile_roles')
    .select('role')
    .eq('profile_id', profile.id)

  const isAdmin = roles?.some(r => r.role === 'admin')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { role, email, studentId } = body

  if (!role || !['coach', 'parent'].includes(role)) {
    return NextResponse.json({ error: 'Geçersiz rol' }, { status: 400 })
  }

  const serviceClient = createServiceRoleClient()
  const { data: invitation, error } = await serviceClient
    .from('invitations')
    .insert({
      role,
      email: email || null,
      student_id: studentId || null,
      created_by: profile.id,
    })
    .select('id, token, role, email, student_id, expires_at, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ invitation })
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { data: roles } = await supabase
    .from('profile_roles')
    .select('role')
    .eq('profile_id', profile.id)

  const isAdmin = roles?.some(r => r.role === 'admin')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: invitations, error } = await supabase
    .from('invitations')
    .select('id, token, role, email, student_id, expires_at, used_at, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ invitations })
}
