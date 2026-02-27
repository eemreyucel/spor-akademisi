interface AttendanceDay {
  date: string
  status: 'present' | 'absent_excused' | 'absent_unexcused'
}

const STATUS_COLORS = {
  present: 'bg-green-400',
  absent_unexcused: 'bg-red-400',
  absent_excused: 'bg-yellow-400',
}

export function AttendanceCalendar({ records }: { records: AttendanceDay[] }) {
  const recordMap = new Map(records.map(r => [r.date, r.status]))

  // Generate last 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })

  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {days.map(day => {
          const status = recordMap.get(day)
          return (
            <div
              key={day}
              title={`${day}: ${status ? (status === 'present' ? 'Katildi' : status === 'absent_excused' ? 'Mazeretli' : 'Gelmedi') : 'Kayit yok'}`}
              className={`w-6 h-6 rounded ${status ? STATUS_COLORS[status] : 'bg-gray-100'}`}
            />
          )
        })}
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-400" /> Katildi</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-400" /> Gelmedi</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-400" /> Mazeretli</span>
      </div>
    </div>
  )
}
