'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ConflictData {
  id: string
  table_name: string
  record_id: string
  client_data: Record<string, unknown>
  server_data: Record<string, unknown>
  created_at: string
}

export function ConflictCard({ conflict }: { conflict: ConflictData }) {
  const [notes, setNotes] = useState('')
  const [resolving, setResolving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function resolve(useClient: boolean) {
    setResolving(true)
    const data = useClient ? conflict.client_data : conflict.server_data

    // Apply the chosen data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from(conflict.table_name as any).update(data).eq('id', conflict.record_id)

    // Mark conflict as resolved
    await supabase.from('sync_conflicts').update({
      resolved: true,
      resolution_notes: notes || (useClient ? 'Client verisi kabul edildi' : 'Server verisi kabul edildi'),
      resolved_at: new Date().toISOString(),
    }).eq('id', conflict.id)

    setResolving(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Çakışma</span>
          <span className="text-xs text-gray-400 ml-2">{conflict.table_name} — {conflict.created_at}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded p-3">
          <p className="text-xs font-medium text-blue-700 mb-1">Coach Verisi</p>
          <pre className="text-xs text-gray-700 overflow-x-auto">{JSON.stringify(conflict.client_data, null, 2)}</pre>
          <button onClick={() => resolve(true)} disabled={resolving} className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50">
            Bunu Kabul Et
          </button>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Server Verisi</p>
          <pre className="text-xs text-gray-700 overflow-x-auto">{JSON.stringify(conflict.server_data, null, 2)}</pre>
          <button onClick={() => resolve(false)} disabled={resolving} className="mt-2 text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 disabled:opacity-50">
            Bunu Kabul Et
          </button>
        </div>
      </div>

      <div>
        <input type="text" placeholder="Çözüm notu (opsiyonel)" value={notes} onChange={e => setNotes(e.target.value)} className="w-full border rounded p-2 text-sm" />
      </div>
    </div>
  )
}
