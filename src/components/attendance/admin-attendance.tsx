'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Group {
  id: string
  name: string
}

interface EnrolledStudent {
  enrollment_id: string
  student_name: string
  status: 'present' | 'absent_unexcused' | 'absent_excused'
}

const STATUS_OPTIONS = [
  { value: 'present', label: 'Mevcut', class: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'absent_unexcused', label: 'Mazeretsiz', class: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'absent_excused', label: 'Mazeretli', class: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
] as const

export function AdminAttendance({ profileId }: { profileId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<EnrolledStudent[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('groups').select('id, name').is('deleted_at', null).order('name').then(({ data }) => {
      setGroups(data ?? [])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedGroup) {
      setStudents([])
      return
    }
    setLoading(true)
    setSaved(false)

    async function load() {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('id, students(full_name)')
        .eq('group_id', selectedGroup)
        .eq('status', 'active')

      if (!enrollments) {
        setStudents([])
        setLoading(false)
        return
      }

      // Check existing attendance for this date
      const enrollmentIds = enrollments.map(e => e.id)
      const { data: existing } = await supabase
        .from('attendance')
        .select('enrollment_id, status')
        .in('enrollment_id', enrollmentIds)
        .eq('date', date)

      const existingMap = new Map((existing ?? []).map(a => [a.enrollment_id, a.status]))

      setStudents(enrollments.map(e => ({
        enrollment_id: e.id,
        student_name: (e.students as unknown as { full_name: string } | null)?.full_name ?? '',
        status: (existingMap.get(e.id) as EnrolledStudent['status']) ?? 'present',
      })))
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup, date])

  function updateStatus(enrollmentId: string, status: EnrolledStudent['status']) {
    setStudents(prev => prev.map(s =>
      s.enrollment_id === enrollmentId ? { ...s, status } : s
    ))
    setSaved(false)
  }

  async function handleSave() {
    if (students.length === 0) return
    setSaving(true)

    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: students.map(s => ({
          enrollment_id: s.enrollment_id,
          date,
          status: s.status,
          marked_by: profileId,
        })),
      }),
    })

    setSaving(false)
    if (res.ok) {
      setSaved(true)
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Grup</label>
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="border rounded-lg p-2 text-sm"
          >
            <option value="">Grup seçiniz</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tarih</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border rounded-lg p-2 text-sm"
          />
        </div>
      </div>

      {loading && <p className="text-gray-400 text-sm">Yükleniyor...</p>}

      {!loading && selectedGroup && students.length === 0 && (
        <p className="text-gray-400 text-sm py-4">Bu grupta aktif öğrenci yok.</p>
      )}

      {students.length > 0 && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Öğrenci</th>
                <th className="text-left px-4 py-3 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.enrollment_id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">{s.student_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => updateStatus(s.enrollment_id, opt.value)}
                          className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                            s.status === opt.value ? opt.class : 'bg-gray-50 text-gray-400 border-gray-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 border-t flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Yoklamayı Kaydet'}
            </button>
            {saved && <span className="text-green-600 text-sm">Kaydedildi!</span>}
          </div>
        </div>
      )}
    </div>
  )
}
