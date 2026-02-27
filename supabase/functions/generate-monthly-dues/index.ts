import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const now = new Date()
  const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 15).toISOString().split('T')[0]

  // Get all active enrollments
  const { data: enrollments, error: fetchError } = await supabase
    .from('enrollments')
    .select('id, monthly_fee')
    .eq('status', 'active')

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 })
  }

  let created = 0
  let skipped = 0
  const errors: string[] = []

  for (const enrollment of enrollments ?? []) {
    const { error } = await supabase.from('payments').insert({
      enrollment_id: enrollment.id,
      amount: enrollment.monthly_fee,
      due_date: dueDate,
      status: 'pending',
      period_month: periodMonth,
    })

    if (error) {
      if (error.code === '23505') {
        // UNIQUE violation — already exists (idempotent)
        skipped++
      } else {
        errors.push(`${enrollment.id}: ${error.message}`)
      }
    } else {
      created++
    }
  }

  // Also mark overdue payments
  await supabase
    .from('payments')
    .update({ status: 'overdue' })
    .eq('status', 'pending')
    .lt('due_date', now.toISOString().split('T')[0])

  return new Response(JSON.stringify({
    period_month: periodMonth,
    created,
    skipped,
    errors,
    total_enrollments: enrollments?.length ?? 0,
  }))
})
