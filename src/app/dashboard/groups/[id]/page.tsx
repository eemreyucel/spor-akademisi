import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/get-user-roles'
import { redirect, notFound } from 'next/navigation'
import { AGE_CATEGORY_LABELS, type AgeCategory } from '@/lib/utils/age-category'
import Link from 'next/link'

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  const supabase = await createServerSupabaseClient()

  // Fetch group
  const { data: group } = await supabase
    .from('groups')
    .select('*, sports(name), profiles(full_name)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!group) notFound()

  // Fetch enrolled students
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, status, monthly_fee, season, students(id, full_name, age_category, dob)')
    .eq('group_id', id)
    .order('created_at', { ascending: false })

  const sportName = Array.isArray(group.sports) ? group.sports[0]?.name : (group.sports as { name: string } | null)?.name
  const coachName = Array.isArray(group.profiles) ? group.profiles[0]?.full_name : (group.profiles as { full_name: string } | null)?.full_name

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/groups" className="text-sm text-blue-600 hover:underline">&larr; Gruplar</Link>
      </div>

      {/* Grup Bilgileri */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{group.name}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Branş</span>
            <p className="font-medium">{sportName ?? '—'}</p>
          </div>
          <div>
            <span className="text-gray-500">Kategori</span>
            <p>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                {AGE_CATEGORY_LABELS[group.age_category as AgeCategory] ?? group.age_category}
              </span>
            </p>
          </div>
          <div>
            <span className="text-gray-500">Antrenör</span>
            <p className="font-medium">{coachName ?? 'Atanmadı'}</p>
          </div>
          <div>
            <span className="text-gray-500">Program</span>
            <p className="font-medium">{group.schedule_description ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Öğrenci Listesi */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-3">
          Öğrenciler ({(enrollments ?? []).length})
        </h2>
        {(enrollments ?? []).length === 0 ? (
          <p className="text-gray-400 text-sm">Bu grupta henüz öğrenci yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Ad Soyad</th>
                  <th className="text-left px-3 py-2 font-medium">Kategori</th>
                  <th className="text-left px-3 py-2 font-medium">Doğum Tarihi</th>
                  <th className="text-right px-3 py-2 font-medium">Ücret</th>
                  <th className="text-left px-3 py-2 font-medium">Sezon</th>
                  <th className="text-left px-3 py-2 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {(enrollments ?? []).map(e => {
                  const student = e.students as unknown as { id: string; full_name: string; age_category: string; dob: string } | null
                  return (
                    <tr key={e.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">
                        <Link href={`/dashboard/students/${student?.id}`} className="hover:text-blue-600 hover:underline">
                          {student?.full_name}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                          {AGE_CATEGORY_LABELS[student?.age_category as AgeCategory] ?? student?.age_category}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">{student?.dob}</td>
                      <td className="px-3 py-2 text-right">{e.monthly_fee} TL</td>
                      <td className="px-3 py-2 text-gray-500">{e.season}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {e.status === 'active' ? 'Aktif' : e.status === 'frozen' ? 'Dondurulmuş' : 'Pasif'}
                        </span>
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
