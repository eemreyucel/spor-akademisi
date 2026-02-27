import type { SyncStatus } from '@/lib/rxdb/sync'

const statusConfig: Record<SyncStatus, { label: string; color: string }> = {
  synced: { label: 'Kaydedildi', color: 'bg-green-100 text-green-700' },
  syncing: { label: 'Senkronize ediliyor...', color: 'bg-yellow-100 text-yellow-700' },
  offline: { label: 'Cevrimdisi', color: 'bg-gray-100 text-gray-600' },
  error: { label: 'Hata', color: 'bg-red-100 text-red-700' },
}

export function SyncIndicator({ status }: { status: SyncStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}
