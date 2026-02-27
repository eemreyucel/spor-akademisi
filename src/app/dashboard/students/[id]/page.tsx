import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/get-user-roles'
import { redirect, notFound } from 'next/navigation'
import { AGE_CATEGORY_LABELS, type AgeCategory } from '@/lib/utils/age-category'
import Link from 'next/link'

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  present: { label: 'Mevcut', class: 'bg-green-100 text-green-700' },
  absent_unexcused: { label: 'Mazeretsiz', class: 'bg-red-100 text-red-700' },
  absent_excused: { label: 'Mazeretli', class: 'bg-yellow-100 text-yellow-700' },
}

const PAYMENT_BADGE: Record<string, { label: string; class: string }> = {
  paid: { label: 'Ödendi', class: 'bg-green-100 text-green-700' },
  pending: { label: 'Bekliyor', class: 'bg-yellow-100 text-yellow-700' },
  overdue: { label: 'Gecikmiş', class: 'bg-red-100 text-red-700' },
}

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  const supabase = await createServerSupabaseClient()

  // Fetch student
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!student) notFound()

  // Fetch enrollments with group info
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, status, monthly_fee, season, start_date, groups(id, name, sports(name))')
    .eq('student_id', id)
    .order('created_at', { ascending: false })

  // Fetch attendance (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const enrollmentIds = (enrollments ?? []).map(e => e.id)

  const { data: attendance } = enrollmentIds.length > 0
    ? await supabase
        .from('attendance')
        .select('id, date, status, enrollments(groups(name))')
        .in('enrollment_id', enrollmentIds)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
    : { data: [] }

  // Fetch payments
  const { data: payments } = enrollmentIds.length > 0
    ? await supabase
        .from('payments')
        .select('id, amount, due_date, paid_date, status, period_month, enrollments(groups(name))')
        .in('enrollment_id', enrollmentIds)
        .order('due_date', { ascending: false })
    : { data: [] }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/students" className="text-sm text-blue-600 hover:underline">&larr; Öğrenciler</Link>
      </div>

      {/* Profil */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{student.full_name}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Kategori</span>
            <p className="font-medium">
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                {AGE_CATEGORY_LABELS[student.age_category as AgeCategory] ?? student.age_category}
              </span>
            </p>
          </div>
          <div>
            <span className="text-gray-500">Doğum Tarihi</span>
            <p className="font-medium">{student.dob}</p>
          </div>
          <div>
            <span className="text-gray-500">Okul</span>
            <p className="font-medium">{student.school ?? '—'}</p>
          </div>
          <div>
            <span className="text-gray-500">Adres</span>
            <p className="font-medium">{student.address ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Gruplar */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Gruplar</h2>
        {(enrollments ?? []).length === 0 ? (
          <p className="text-gray-400 text-sm">Henüz gruba kayıt yok.</p>
        ) : (
          <div className="space-y-2">
            {(enrollments ?? []).map(e => {
              const group = e.groups as unknown as { id: string; name: string; sports: { name: string }[] | { name: string } | null } | null
              const sportName = Array.isArray(group?.sports) ? group?.sports[0]?.name : (group?.sports as { name: string } | null)?.name
              return (
                <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Link href={`/dashboard/groups/${group?.id}`} className="font-medium hover:text-blue-600">
                      {group?.name}
                    </Link>
                    {sportName && <span className="text-gray-500 text-sm ml-2">({sportName})</span>}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs ${e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {e.status === 'active' ? 'Aktif' : e.status === 'frozen' ? 'Dondurulmuş' : 'Pasif'}
                    </span>
                    <span className="text-gray-500">{e.monthly_fee} TL/ay</span>
                    <span className="text-gray-400">{e.season}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Yoklama (Son 30 gün) */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Yoklama (Son 30 Gün)</h2>
        {(attendance ?? []).length === 0 ? (
          <p className="text-gray-400 text-sm">Yoklama kaydı yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Tarih</th>
                  <th className="text-left px-3 py-2 font-medium">Grup</th>
                  <th className="text-left px-3 py-2 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {(attendance ?? []).map(a => {
                  const enrollment = a.enrollments as unknown as { groups: { name: string } | null } | null
                  const badge = STATUS_BADGE[a.status] ?? { label: a.status, class: 'bg-gray-100 text-gray-600' }
                  return (
                    <tr key={a.id} className="border-b last:border-b-0">
                      <td className="px-3 py-2">{a.date}</td>
                      <td className="px-3 py-2 text-gray-500">{enrollment?.groups?.name ?? '-'}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${badge.class}`}>{badge.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ödemeler */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-3">Ödemeler</h2>
        {(payments ?? []).length === 0 ? (
          <p className="text-gray-400 text-sm">Ödeme kaydı yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Dönem</th>
                  <th className="text-left px-3 py-2 font-medium">Grup</th>
                  <th className="text-right px-3 py-2 font-medium">Tutar</th>
                  <th className="text-left px-3 py-2 font-medium">Son Tarih</th>
                  <th className="text-left px-3 py-2 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {(payments ?? []).map(p => {
                  const enrollment = p.enrollments as unknown as { groups: { name: string } | null } | null
                  const badge = PAYMENT_BADGE[p.status] ?? PAYMENT_BADGE.pending
                  return (
                    <tr key={p.id} className="border-b last:border-b-0">
                      <td className="px-3 py-2">{p.period_month}</td>
                      <td className="px-3 py-2 text-gray-500">{enrollment?.groups?.name ?? '-'}</td>
                      <td className="px-3 py-2 text-right">{p.amount} TL</td>
                      <td className="px-3 py-2 text-gray-500">{p.due_date}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${badge.class}`}>{badge.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
