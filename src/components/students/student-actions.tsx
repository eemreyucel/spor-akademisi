'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteStudentButton({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')) return
    setLoading(true)
    await fetch(`/api/students/${studentId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:underline text-xs disabled:opacity-50"
    >
      {loading ? 'Siliniyor...' : 'Sil'}
    </button>
  )
}

interface GroupWithFee {
  id: string
  name: string
}

interface Enrollment {
  group_name: string
  monthly_fee: number
}

export function EnrollStudentButton({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false)
  const [groups, setGroups] = useState<GroupWithFee[]>([])
  const [existingEnrollments, setExistingEnrollments] = useState<Enrollment[]>([])
  const [groupId, setGroupId] = useState('')
  const [monthlyFee, setMonthlyFee] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      // Load groups
      fetch('/api/groups')
        .then(r => r.json())
        .then(data => setGroups(data.groups ?? []))

      // Load existing enrollments for this student
      const supabase = (async () => {
        const { createClient } = await import('@/lib/supabase/client')
        return createClient()
      })()
      supabase.then(client => {
        client
          .from('enrollments')
          .select('monthly_fee, groups(name)')
          .eq('student_id', studentId)
          .eq('status', 'active')
          .then(({ data }) => {
            if (data) {
              setExistingEnrollments(data.map((e: Record<string, unknown>) => ({
                group_name: (e.groups as { name: string } | null)?.name ?? '',
                monthly_fee: (e.monthly_fee as number) ?? 0,
              })))
            }
          })
      })
    }
  }, [open, studentId])

  async function handleEnroll() {
    if (!groupId) return
    setLoading(true)
    setError(null)

    const fee = monthlyFee ? Number(monthlyFee) : 0
    const res = await fetch(`/api/students/${studentId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, monthlyFee: fee }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      setLoading(false)
      return
    }

    setOpen(false)
    setLoading(false)
    setGroupId('')
    setMonthlyFee('')
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-blue-600 hover:underline text-xs">
        Grup Ata
      </button>
    )
  }

  return (
    <div className="space-y-2">
      {existingEnrollments.length > 0 && (
        <div className="text-xs text-gray-500">
          Mevcut: {existingEnrollments.map(e => `${e.group_name} (${e.monthly_fee} TL)`).join(', ')}
        </div>
      )}
      {error && <div className="text-xs text-red-600">{error}</div>}
      <div className="flex items-center gap-2">
        <select
          value={groupId}
          onChange={e => setGroupId(e.target.value)}
          className="border rounded px-2 py-1 text-xs"
        >
          <option value="">Grup seç</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Ücret (TL)"
          value={monthlyFee}
          onChange={e => setMonthlyFee(e.target.value)}
          className="border rounded px-2 py-1 text-xs w-24"
        />
        <button
          onClick={handleEnroll}
          disabled={loading || !groupId}
          className="bg-blue-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
        >
          {loading ? '...' : 'Kaydet'}
        </button>
        <button onClick={() => { setOpen(false); setError(null) }} className="text-gray-400 hover:underline text-xs">
          İptal
        </button>
      </div>
    </div>
  )
}
