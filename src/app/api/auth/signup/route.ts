import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { token, fullName, email, password } = body

  if (!token || !fullName || !email || !password) {
    return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

  // Validate token
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .select('id, token, role, email, student_id, expires_at, used_at')
    .eq('token', token)
    .single()

  if (invError || !invitation) {
    return NextResponse.json({ error: 'Geçersiz davet linki' }, { status: 404 })
  }

  if (invitation.used_at) {
    return NextResponse.json({ error: 'Bu davet linki zaten kullanılmış' }, { status: 400 })
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Bu davet linkinin süresi dolmuş' }, { status: 400 })
  }

  // If invitation has a specific email, enforce it
  if (invitation.email && invitation.email !== email) {
    return NextResponse.json({ error: 'Bu davet farklı bir e-posta adresi için oluşturulmuş' }, { status: 400 })
  }

  // Create user via admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı' }, { status: 400 })
    }
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  const userId = authData.user.id

  // Create profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({ user_id: userId, full_name: fullName, email })
    .select('id')
    .single()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // Assign role
  const { error: roleError } = await supabase
    .from('profile_roles')
    .insert({ profile_id: profile.id, role: invitation.role })

  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 500 })
  }

  // If parent invitation with student_id, create parent-student link
  if (invitation.role === 'parent' && invitation.student_id) {
    await supabase
      .from('parent_students')
      .insert({ parent_profile_id: profile.id, student_id: invitation.student_id })
  }

  // Mark invitation as used
  await supabase
    .from('invitations')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invitation.id)

  return NextResponse.json({ success: true })
}
