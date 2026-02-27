'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AGE_CATEGORY_LABELS, type AgeCategory } from '@/lib/utils/age-category'

export function GroupForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sports, setSports] = useState<any[]>([])
  const [coaches, setCoaches] = useState<any[]>([])

  const [form, setForm] = useState({
    name: '', sportId: '', coachProfileId: '', ageCategory: '' as AgeCategory | '', scheduleDescription: '',
  })

  useEffect(() => {
    supabase.from('sports').select('*').then(({ data }) => setSports(data ?? []))
    supabase.from('profile_roles').select('profile_id, profiles(id, full_name)').eq('role', 'coach').then(({ data }) => {
      setCoaches((data ?? []).map((d: any) => d.profiles))
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: err } = await supabase.from('groups').insert({
      name: form.name,
      sport_id: form.sportId,
      coach_profile_id: form.coachProfileId || null,
      age_category: form.ageCategory,
      schedule_description: form.scheduleDescription || null,
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/dashboard/groups')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">Yeni Grup</h1>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Grup Adı *</label>
        <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border rounded-lg p-2" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Spor Dalı *</label>
        <select required value={form.sportId} onChange={e => setForm(p => ({ ...p, sportId: e.target.value }))} className="w-full border rounded-lg p-2">
          <option value="">Seçiniz</option>
          {sports.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Yaş Kategorisi *</label>
        <select required value={form.ageCategory} onChange={e => setForm(p => ({ ...p, ageCategory: e.target.value as AgeCategory }))} className="w-full border rounded-lg p-2">
          <option value="">Seçiniz</option>
          {Object.entries(AGE_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Antrenör</label>
        <select value={form.coachProfileId} onChange={e => setForm(p => ({ ...p, coachProfileId: e.target.value }))} className="w-full border rounded-lg p-2">
          <option value="">Seçiniz (opsiyonel)</option>
          {coaches.filter(Boolean).map((c: any) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Program Açıklaması</label>
        <textarea value={form.scheduleDescription} onChange={e => setForm(p => ({ ...p, scheduleDescription: e.target.value }))} className="w-full border rounded-lg p-2" rows={2} placeholder="Ör: Pazartesi-Çarşamba-Cuma 16:00-17:30" />
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-lg border hover:bg-gray-50">İptal</button>
      </div>
    </form>
  )
}
