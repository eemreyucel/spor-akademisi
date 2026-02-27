import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { enrollment_id, amount, due_date, period_month, notes } = body

  if (!enrollment_id || !amount || !due_date || !period_month) {
    return NextResponse.json({ error: 'enrollment_id, amount, due_date ve period_month zorunludur' }, { status: 400 })
  }

  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      enrollment_id,
      amount: parseFloat(amount),
      due_date,
      period_month,
      status: 'pending',
      notes: notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ payment })
}
