import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'

export default async function PaymentsPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const isParent = profile.roles.includes('parent') && !profile.roles.includes('admin')

  let query = supabase
    .from('payments')
    .select('*, enrollments(students(full_name), groups(name, sports(name)))')
    .order('due_date', { ascending: false })

  const { data: payments } = await query

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      paid: { label: 'Ödendi', class: 'bg-green-100 text-green-700' },
      pending: { label: 'Bekliyor', class: 'bg-yellow-100 text-yellow-700' },
      overdue: { label: 'Gecikmiş', class: 'bg-red-100 text-red-700' },
    }
    const cfg = map[status] ?? map.pending
    return <span className={`text-xs px-2 py-0.5 rounded ${cfg.class}`}>{cfg.label}</span>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ödemeler</h1>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Öğrenci</th>
              <th className="text-left p-3 font-medium">Grup</th>
              <th className="text-left p-3 font-medium">Dönem</th>
              <th className="text-right p-3 font-medium">Tutar</th>
              <th className="text-left p-3 font-medium">Son Tarih</th>
              <th className="text-left p-3 font-medium">Durum</th>
              {!isParent && <th className="text-left p-3 font-medium">İşlem</th>}
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{p.enrollments?.students?.full_name}</td>
                <td className="p-3 text-gray-500">{p.enrollments?.groups?.name}</td>
                <td className="p-3">{p.period_month}</td>
                <td className="p-3 text-right">{p.amount} TL</td>
                <td className="p-3 text-gray-500">{p.due_date}</td>
                <td className="p-3">{statusBadge(p.status)}</td>
                {!isParent && (
                  <td className="p-3">
                    {p.status !== 'paid' && (
                      <form action={`/api/payments/${p.id}/mark-paid`} method="POST">
                        <button className="text-xs text-blue-600 hover:underline">Ödendi İşaretle</button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {(payments ?? []).length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">Ödeme kaydı yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
