'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getDatabase, type AttendanceStatus } from '@/lib/rxdb/database'
import { syncAttendance, setupAutoSync, type SyncStatus } from '@/lib/rxdb/sync'
import { SyncIndicator } from './sync-indicator'

interface Group {
  id: string
  name: string
}

interface EnrolledStudent {
  enrollment_id: string
  student_name: string
}

interface StudentAttendance {
  enrollment_id: string
  student_name: string
  status: AttendanceStatus
}

const STATUS_CYCLE: AttendanceStatus[] = ['present', 'absent_unexcused', 'absent_excused']

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: 'bg-green-500',
  absent_unexcused: 'bg-red-500',
  absent_excused: 'bg-yellow-400',
}

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Mevcut',
  absent_unexcused: 'Mazeretsiz',
  absent_excused: 'Mazeretli',
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

export function CoachAttendance({ profileId }: { profileId: string }) {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [students, setStudents] = useState<StudentAttendance[]>([])
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Fetch coach's groups
  useEffect(() => {
    async function fetchGroups() {
      const supabase = createClient()
      const { data } = await supabase
        .from('groups')
        .select('id, name')
        .eq('coach_profile_id', profileId)
        .is('deleted_at', null)
        .order('name')

      setGroups(data ?? [])
      setLoading(false)
    }
    fetchGroups()
  }, [profileId])

  // Setup auto-sync on online/offline events
  useEffect(() => {
    const cleanup = setupAutoSync(setSyncStatus)
    return cleanup
  }, [])

  // Fetch enrolled students when group changes
  useEffect(() => {
    if (!selectedGroupId) {
      setStudents([])
      return
    }

    async function fetchStudents() {
      setLoading(true)
      setSaved(false)
      const supabase = createClient()

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('id, students(full_name)')
        .eq('group_id', selectedGroupId)
        .eq('status', 'active')
        .order('created_at')

      const enrolled: EnrolledStudent[] = (enrollments ?? []).map((e) => {
        const students = e.students as unknown as { full_name: string } | null
        return {
          enrollment_id: e.id,
          student_name: students?.full_name ?? 'Bilinmiyor',
        }
      })

      // Check if there are existing attendance records for today in RxDB
      const today = getTodayDate()
      const db = await getDatabase()
      const existingDocs = await db.attendance
        .find({ selector: { date: today } })
        .exec()

      const existingMap = new Map(
        existingDocs.map((doc) => [doc.enrollment_id, doc.status as AttendanceStatus])
      )

      // Default all to 'present', but use existing status if found
      const attendanceList: StudentAttendance[] = enrolled.map((s) => ({
        enrollment_id: s.enrollment_id,
        student_name: s.student_name,
        status: existingMap.get(s.enrollment_id) ?? 'present',
      }))

      setStudents(attendanceList)
      setLoading(false)
    }
    fetchStudents()
  }, [selectedGroupId])

  // Cycle attendance status on tap
  const handleTapStudent = useCallback((enrollmentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.enrollment_id !== enrollmentId) return s
        const currentIndex = STATUS_CYCLE.indexOf(s.status)
        const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length
        return { ...s, status: STATUS_CYCLE[nextIndex] }
      })
    )
    setSaved(false)
  }, [])

  // Save to RxDB (IndexedDB)
  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const db = await getDatabase()
      const today = getTodayDate()
      const now = new Date().toISOString()

      for (const student of students) {
        // Check for existing record
        const existing = await db.attendance
          .findOne({
            selector: {
              enrollment_id: student.enrollment_id,
              date: today,
            },
          })
          .exec()

        if (existing) {
          // Update existing record
          await existing.patch({
            status: student.status,
            updated_at: now,
            synced_at: null, // Mark as needing re-sync
          })
        } else {
          // Insert new record
          await db.attendance.insert({
            id: crypto.randomUUID(),
            enrollment_id: student.enrollment_id,
            date: today,
            status: student.status,
            marked_by_profile_id: profileId,
            synced_at: null,
            created_at: now,
            updated_at: now,
          })
        }
      }

      setSaved(true)

      // Trigger background sync if online
      syncAttendance(setSyncStatus)
    } catch (err) {
      console.error('Save error:', err)
      setSyncStatus('error')
    } finally {
      setSaving(false)
    }
  }, [students, profileId])

  if (loading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Yukleniyor...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yoklama</h1>
        <SyncIndicator status={syncStatus} />
      </div>

      {/* Group selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Grup Secin</label>
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroupId(group.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedGroupId === group.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-700 hover:bg-gray-50'
              }`}
            >
              {group.name}
            </button>
          ))}
          {groups.length === 0 && (
            <p className="text-gray-400 text-sm">Henuz atanmis grubunuz yok.</p>
          )}
        </div>
      </div>

      {/* Date display */}
      {selectedGroupId && (
        <p className="text-sm text-gray-500 mb-4">
          Tarih: <span className="font-medium text-gray-700">{getTodayDate()}</span>
        </p>
      )}

      {/* Student list */}
      {loading && selectedGroupId && (
        <p className="text-gray-500 py-8 text-center">Ogrenciler yukleniyor...</p>
      )}

      {!loading && selectedGroupId && students.length === 0 && (
        <p className="text-gray-400 py-8 text-center">Bu grupta aktif ogrenci bulunmuyor.</p>
      )}

      {!loading && students.length > 0 && (
        <>
          {/* Legend */}
          <div className="flex gap-4 mb-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Mevcut
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Mazeretsiz
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> Mazeretli
            </span>
          </div>

          <div className="space-y-2 mb-6">
            {students.map((student) => (
              <button
                key={student.enrollment_id}
                type="button"
                onClick={() => handleTapStudent(student.enrollment_id)}
                className="w-full flex items-center gap-3 bg-white border rounded-lg px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              >
                <span
                  className={`w-4 h-4 rounded-full flex-shrink-0 ${STATUS_COLORS[student.status]}`}
                  title={STATUS_LABELS[student.status]}
                />
                <span className="text-sm font-medium text-gray-800 flex-1">
                  {student.student_name}
                </span>
                <span className="text-xs text-gray-400">
                  {STATUS_LABELS[student.status]}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi' : 'Kaydet'}
          </button>

          {saved && (
            <p className="text-center text-sm text-green-600 mt-2">
              Yoklama yerel olarak kaydedildi.
              {syncStatus === 'synced' && ' Sunucuya senkronize edildi.'}
              {syncStatus === 'offline' && ' Cevrimici olunca senkronize edilecek.'}
            </p>
          )}
        </>
      )}
    </div>
  )
}
