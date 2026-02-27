import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AGE_CATEGORY_LABELS, type AgeCategory } from '@/lib/utils/age-category'
import Link from 'next/link'
import { DeleteStudentButton, EnrollStudentButton } from '@/components/students/student-actions'

export default async function StudentsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, dob, age_category, school, created_at, enrollments(id, groups(name))')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Öğrenciler</h1>
        <Link href="/dashboard/students/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          Yeni Öğrenci
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Ad Soyad</th>
              <th className="text-left p-3 font-medium">Kategori</th>
              <th className="text-left p-3 font-medium">Grup</th>
              <th className="text-left p-3 font-medium">Okul</th>
              <th className="text-left p-3 font-medium">Doğum Tarihi</th>
              <th className="text-left p-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {(students ?? []).map(s => {
              const enrollments = s.enrollments ?? []
              const groups = enrollments.map((e: { groups: { name: string } | { name: string }[] | null }) => {
                const g = Array.isArray(e.groups) ? e.groups[0] : e.groups
                return g?.name
              }).filter(Boolean)

              return (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">
                    <Link href={`/dashboard/students/${s.id}`} className="hover:text-blue-600 hover:underline">
                      {s.full_name}
                    </Link>
                  </td>
                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                      {AGE_CATEGORY_LABELS[s.age_category as AgeCategory] ?? s.age_category}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">
                    {groups.length > 0 ? groups.join(', ') : <EnrollStudentButton studentId={s.id} />}
                  </td>
                  <td className="p-3 text-gray-500">{s.school ?? '—'}</td>
                  <td className="p-3 text-gray-500">{s.dob}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {groups.length === 0 ? null : <EnrollStudentButton studentId={s.id} />}
                      <DeleteStudentButton studentId={s.id} />
                    </div>
                  </td>
                </tr>
              )
            })}
            {(students ?? []).length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">Henüz öğrenci kaydı yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
