import { getUserProfile } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ChildDashboard } from '@/components/parent/child-dashboard'

export default async function DashboardPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  const isParent = profile.roles.includes('parent')

  if (!isParent) {
    // Admin/Coach home
    const supabase = await createServerSupabaseClient()

    const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).is('deleted_at', null)
    const { count: groupCount } = await supabase.from('groups').select('*', { count: 'exact', head: true }).is('deleted_at', null)
    const { count: overdueCount } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'overdue')

    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Hos Geldiniz, {profile.fullName}</h1>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Toplam Ogrenci</p>
            <p className="text-3xl font-bold">{studentCount ?? 0}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Aktif Grup</p>
            <p className="text-3xl font-bold">{groupCount ?? 0}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Gecikmis Odeme</p>
            <p className="text-3xl font-bold text-red-600">{overdueCount ?? 0}</p>
          </div>
        </div>
      </div>
    )
  }

  // Parent view: show children
  const supabase = await createServerSupabaseClient()

  const { data: links } = await supabase
    .from('parent_students')
    .select('student_id, students(full_name, enrollments(id, groups(name, sports(name))))')
    .eq('parent_profile_id', profile.id)

  const children = []
  for (const link of links ?? []) {
    const studentArr = link.students
    const student = Array.isArray(studentArr) ? studentArr[0] : studentArr
    if (!student) continue

    const enrollments = student.enrollments ?? []

    if (enrollments.length === 0) {
      children.push({
        studentName: student.full_name,
        groupName: '',
        sportName: '',
        attendance: [],
        payments: [],
      })
      continue
    }

    for (const enrollment of enrollments) {
      const { data: attendance } = await supabase
        .from('attendance')
        .select('date, status')
        .eq('enrollment_id', enrollment.id)
        .order('date', { ascending: false })
        .limit(30)

      const { data: payments } = await supabase
        .from('payments')
        .select('period_month, amount, status, due_date')
        .eq('enrollment_id', enrollment.id)
        .order('due_date', { ascending: false })

      const groups = enrollment.groups
      const group = Array.isArray(groups) ? groups[0] : groups
      const sports = group?.sports
      const sport = Array.isArray(sports) ? sports[0] : sports

      children.push({
        studentName: student.full_name,
        groupName: group?.name ?? '',
        sportName: sport?.name ?? '',
        attendance: attendance ?? [],
        payments: payments ?? [],
      })
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Hos Geldiniz, {profile.fullName}</h1>
      <div className="space-y-6">
        {children.map((child, i) => (
          <ChildDashboard key={i} child={child} />
        ))}
        {children.length === 0 && <p className="text-gray-400">Kayitli ogrenci bulunamadi.</p>}
      </div>
    </div>
  )
}
