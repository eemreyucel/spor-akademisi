import { getUserProfile } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { CoachAttendance } from '@/components/attendance/coach-attendance'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const STATUS_BADGE: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  absent_unexcused: 'bg-red-100 text-red-700',
  absent_excused: 'bg-yellow-100 text-yellow-700',
}

const STATUS_LABEL: Record<string, string> = {
  present: 'Mevcut',
  absent_unexcused: 'Mazeretsiz',
  absent_excused: 'Mazeretli',
}

export default async function AttendancePage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  if (profile.roles.includes('coach')) {
    return <CoachAttendance profileId={profile.id} />
  }

  // Admin: show today's attendance overview
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: records } = await supabase
    .from('attendance')
    .select('id, date, status, enrollments(students(full_name), groups(name))')
    .eq('date', today)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yoklama</h1>
        <span className="text-sm text-gray-500">Tarih: {today}</span>
      </div>

      {(!records || records.length === 0) ? (
        <p className="text-gray-400 text-center py-8">Bugun icin yoklama kaydedilmemis.</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ogrenci</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Grup</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const enrollment = record.enrollments as unknown as {
                  students: { full_name: string } | null
                  groups: { name: string } | null
                } | null
                const studentName = enrollment?.students?.full_name ?? 'Bilinmiyor'
                const groupName = enrollment?.groups?.name ?? '-'
                const status = record.status
                return (
                  <tr key={record.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 text-gray-800">{studentName}</td>
                    <td className="px-4 py-3 text-gray-600">{groupName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABEL[status] ?? status}
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
  )
}
