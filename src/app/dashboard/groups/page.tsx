import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AGE_CATEGORY_LABELS, type AgeCategory } from '@/lib/utils/age-category'
import Link from 'next/link'
import { DeleteGroupButton } from '@/components/groups/delete-group-button'

export default async function GroupsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: groups } = await supabase
    .from('groups')
    .select('id, name, age_category, schedule_description, sports(name), profiles(full_name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gruplar</h1>
        <Link href="/dashboard/groups/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          Yeni Grup
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(groups ?? []).map(g => (
          <div key={g.id} className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold">{g.name}</h3>
            <p className="text-sm text-gray-500">{g.sports?.[0]?.name}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {AGE_CATEGORY_LABELS[g.age_category as AgeCategory] ?? g.age_category}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {g.profiles?.[0]?.full_name ?? 'Antrenör atanmadı'}
              </span>
            </div>
            {g.schedule_description && <p className="text-xs text-gray-400 mt-2">{g.schedule_description}</p>}
            <div className="mt-3 pt-2 border-t">
              <DeleteGroupButton groupId={g.id} />
            </div>
          </div>
        ))}
        {(groups ?? []).length === 0 && (
          <p className="text-gray-400 col-span-full text-center py-8">Henüz grup oluşturulmadı.</p>
        )}
      </div>
    </div>
  )
}
