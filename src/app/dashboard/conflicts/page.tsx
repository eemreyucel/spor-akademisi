import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ConflictCard } from '@/components/conflicts/conflict-card'

export default async function ConflictsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: conflicts } = await supabase
    .from('sync_conflicts')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Çakışmalar</h1>
        {(conflicts ?? []).length > 0 && (
          <span className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full">
            {conflicts?.length} çözümlenmemiş
          </span>
        )}
      </div>

      <div className="space-y-4">
        {(conflicts ?? []).map(c => (
          <ConflictCard key={c.id} conflict={c} />
        ))}
        {(conflicts ?? []).length === 0 && (
          <div className="bg-white rounded-lg border p-8 text-center text-gray-400">
            Çözümlenmemiş çakışma yok.
          </div>
        )}
      </div>
    </div>
  )
}
