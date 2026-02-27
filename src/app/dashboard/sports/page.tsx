'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Sport {
  id: string
  name: string
}

export default function SportsPage() {
  const supabase = createClient()
  const [sports, setSports] = useState<Sport[]>([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadSports() {
    const { data } = await supabase.from('sports').select('id, name').order('name')
    setSports(data ?? [])
  }

  useEffect(() => {
    loadSports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/sports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      setLoading(false)
      return
    }

    setNewName('')
    setLoading(false)
    loadSports()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" branşını silmek istediğinize emin misiniz?`)) return

    const res = await fetch(`/api/sports/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      return
    }
    loadSports()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Branşlar</h1>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

      {/* Yeni branş ekleme */}
      <form onSubmit={handleAdd} className="flex gap-3 mb-6">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Yeni branş adı"
          className="border rounded-lg p-2 text-sm flex-1 max-w-xs"
        />
        <button
          type="submit"
          disabled={loading || !newName.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Ekleniyor...' : 'Ekle'}
        </button>
      </form>

      {/* Branş listesi */}
      <div className="bg-white rounded-lg border">
        {sports.length === 0 ? (
          <p className="p-6 text-center text-gray-400">Henüz branş eklenmemiş.</p>
        ) : (
          <ul className="divide-y">
            {sports.map(s => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3">
                <span className="font-medium">{s.name}</span>
                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  className="text-red-600 hover:underline text-xs"
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
