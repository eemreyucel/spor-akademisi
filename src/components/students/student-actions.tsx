'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Group {
  id: string
  name: string
}

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

export function EnrollStudentButton({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [groupId, setGroupId] = useState('')
  const [monthlyFee, setMonthlyFee] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open && groups.length === 0) {
      fetch('/api/groups')
        .then(r => r.json())
        .then(data => setGroups(data.groups ?? []))
    }
  }, [open, groups.length])

  async function handleEnroll() {
    if (!groupId) return
    setLoading(true)
    await fetch(`/api/students/${studentId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, monthlyFee: monthlyFee ? Number(monthlyFee) : 0 }),
    })
    setOpen(false)
    setLoading(false)
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
        placeholder="Ücret"
        value={monthlyFee}
        onChange={e => setMonthlyFee(e.target.value)}
        className="border rounded px-2 py-1 text-xs w-20"
      />
      <button
        onClick={handleEnroll}
        disabled={loading || !groupId}
        className="bg-blue-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
      >
        {loading ? '...' : 'Kaydet'}
      </button>
      <button onClick={() => setOpen(false)} className="text-gray-400 hover:underline text-xs">
        İptal
      </button>
    </div>
  )
}
