import { AttendanceCalendar } from './attendance-calendar'

interface ChildData {
  studentName: string
  groupName: string
  sportName: string
  attendance: { date: string; status: 'present' | 'absent_excused' | 'absent_unexcused' }[]
  payments: { period_month: string; amount: number; status: string; due_date: string }[]
}

export function ChildDashboard({ child }: { child: ChildData }) {
  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-lg">{child.studentName}</h3>
        <p className="text-sm text-gray-500">{child.sportName} — {child.groupName}</p>
      </div>

      <div>
        <h4 className="font-medium text-sm mb-2">Yoklama (Son 30 Gun)</h4>
        <AttendanceCalendar records={child.attendance} />
      </div>

      <div>
        <h4 className="font-medium text-sm mb-2">Odemeler</h4>
        <div className="space-y-1">
          {child.payments.map(p => (
            <div key={p.period_month} className="flex justify-between items-center text-sm py-1">
              <span>{p.period_month}</span>
              <span>{p.amount} TL</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                p.status === 'paid' ? 'bg-green-100 text-green-700' :
                p.status === 'overdue' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {p.status === 'paid' ? 'Odendi' : p.status === 'overdue' ? 'Gecikmis' : 'Bekliyor'}
              </span>
            </div>
          ))}
          {child.payments.length === 0 && <p className="text-gray-400 text-sm">Odeme kaydi yok.</p>}
        </div>
      </div>
    </div>
  )
}
