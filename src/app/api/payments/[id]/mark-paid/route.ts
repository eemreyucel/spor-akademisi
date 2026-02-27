import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('payments')
    .update({
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.redirect(new URL('/dashboard/payments', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}
