import { createClient } from '@/lib/supabase/client'
import { getDatabase } from './database'

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

/**
 * Syncs all unsynced attendance records from RxDB (IndexedDB) to Supabase.
 * Finds records where synced_at is null, upserts them to Supabase,
 * and marks them as synced with a timestamp.
 */
export async function syncAttendance(
  onStatusChange: (status: SyncStatus) => void
): Promise<void> {
  if (!navigator.onLine) {
    onStatusChange('offline')
    return
  }

  onStatusChange('syncing')

  try {
    const db = await getDatabase()
    const supabase = createClient()

    // Find all records that haven't been synced yet
    const unsyncedDocs = await db.attendance
      .find({ selector: { synced_at: { $eq: null } } })
      .exec()

    if (unsyncedDocs.length === 0) {
      onStatusChange('synced')
      return
    }

    // Upsert each unsynced record to Supabase
    for (const doc of unsyncedDocs) {
      const record = {
        id: doc.id,
        enrollment_id: doc.enrollment_id,
        date: doc.date,
        status: doc.status,
        marked_by_profile_id: doc.marked_by_profile_id,
        synced_at: new Date().toISOString(),
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      }

      const { error } = await supabase
        .from('attendance')
        .upsert(record, { onConflict: 'enrollment_id,date' })

      if (error) {
        console.error('Supabase sync error for record', doc.id, error)
        onStatusChange('error')
        return
      }

      // Mark as synced in RxDB
      await doc.patch({ synced_at: new Date().toISOString() })
    }

    onStatusChange('synced')
  } catch (err) {
    console.error('Attendance sync failed:', err)
    onStatusChange('error')
  }
}

/**
 * Sets up automatic sync when the browser comes back online.
 * Returns a cleanup function.
 */
export function setupAutoSync(
  onStatusChange: (status: SyncStatus) => void
): () => void {
  function handleOnline() {
    syncAttendance(onStatusChange)
  }

  function handleOffline() {
    onStatusChange('offline')
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Set initial status
  if (!navigator.onLine) {
    onStatusChange('offline')
  }

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}
