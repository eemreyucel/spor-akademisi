import { createServerSupabaseClient } from '@/lib/supabase/server'
import { validateTcKimlik } from '@/lib/utils/tc-kimlik'
import { calculateAgeCategory } from '@/lib/utils/age-category'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { fullName, dob, tcKimlik, school, address, groupId, season, monthlyFee } = body

  if (tcKimlik && !validateTcKimlik(tcKimlik)) {
    return NextResponse.json({ error: 'Geçersiz TC Kimlik numarası' }, { status: 400 })
  }

  const ageCategory = calculateAgeCategory(new Date(dob))
  if (!ageCategory) {
    return NextResponse.json({ error: 'Yaş aralığı 6-17 olmalıdır' }, { status: 400 })
  }

  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert({
      full_name: fullName,
      dob,
      school: school || null,
      address: address || null,
      age_category: ageCategory,
    })
    .select()
    .single()

  if (studentError) return NextResponse.json({ error: studentError.message }, { status: 500 })

  if (groupId) {
    await supabase.from('enrollments').insert({
      student_id: student.id,
      group_id: groupId,
      season: season || '2025-2026',
      monthly_fee: monthlyFee || 0,
      start_date: new Date().toISOString().split('T')[0],
    })
  }

  return NextResponse.json({ student })
}

export async function GET() {
  const supabase = await createServerSupabaseClient()

  const { data: students, error } = await supabase
    .from('students')
    .select('id, full_name, dob, age_category, school, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ students })
}
