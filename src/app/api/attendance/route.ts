import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { records } = body as { records: { enrollment_id: string; date: string; status: string; marked_by: string }[] }

  if (!records || records.length === 0) {
    return NextResponse.json({ error: 'records dizisi zorunludur' }, { status: 400 })
  }

  const rows = records.map(r => ({
    enrollment_id: r.enrollment_id,
    date: r.date,
    status: r.status,
    marked_by_profile_id: r.marked_by,
  }))

  const { data, error } = await supabase
    .from('attendance')
    .upsert(rows, { onConflict: 'enrollment_id,date' })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ attendance: data })
}
