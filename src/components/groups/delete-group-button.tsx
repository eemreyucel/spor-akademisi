'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteGroupButton({ groupId }: { groupId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Bu grubu silmek istediğinize emin misiniz?')) return
    setLoading(true)
    await fetch(`/api/groups/${groupId}`, { method: 'DELETE' })
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
