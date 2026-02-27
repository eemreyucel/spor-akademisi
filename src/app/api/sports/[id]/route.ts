import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if any groups use this sport
  const { data: groups } = await supabase
    .from('groups')
    .select('id')
    .eq('sport_id', id)
    .is('deleted_at', null)
    .limit(1)

  if (groups && groups.length > 0) {
    return NextResponse.json({ error: 'Bu branşa atanmış grup var, önce grupları silin' }, { status: 400 })
  }

  const { error } = await supabase
    .from('sports')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
