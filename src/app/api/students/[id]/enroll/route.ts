import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: studentId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { groupId, season, monthlyFee } = body

  if (!groupId) {
    return NextResponse.json({ error: 'Grup seçimi zorunludur' }, { status: 400 })
  }

  const { data: enrollment, error } = await supabase
    .from('enrollments')
    .insert({
      student_id: studentId,
      group_id: groupId,
      season: season || '2025-2026',
      monthly_fee: monthlyFee || 0,
      start_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ enrollment })
}
