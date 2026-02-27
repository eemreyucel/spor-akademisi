import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token gerekli' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('id, token, role, email, student_id, expires_at, used_at')
    .eq('token', token)
    .single()

  if (error || !invitation) {
    return NextResponse.json({ error: 'Geçersiz davet linki' }, { status: 404 })
  }

  if (invitation.used_at) {
    return NextResponse.json({ error: 'Bu davet linki zaten kullanılmış' }, { status: 400 })
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Bu davet linkinin süresi dolmuş' }, { status: 400 })
  }

  return NextResponse.json({
    valid: true,
    role: invitation.role,
    email: invitation.email,
  })
}
