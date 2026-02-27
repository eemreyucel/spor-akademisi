'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateTcKimlik } from '@/lib/utils/tc-kimlik'
import { calculateAgeCategory, AGE_CATEGORY_LABELS, type AgeCategory } from '@/lib/utils/age-category'

export function StudentForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [groups, setGroups] = useState<{ id: string; name: string; age_category: string; sports: { name: string } | null }[]>([])
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null)

  const [form, setForm] = useState({
    fullName: '', dob: '', tcKimlik: '', school: '', address: '',
    groupId: '', monthlyFee: '',
  })

  useEffect(() => {
    supabase.from('groups').select('*, sports(name)').is('deleted_at', null).then(({ data }) => {
      setGroups((data ?? []) as { id: string; name: string; age_category: string; sports: { name: string } | null }[])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (form.dob) {
      const cat = calculateAgeCategory(new Date(form.dob))
      setSuggestedCategory(cat)
    }
  }, [form.dob])

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (form.tcKimlik && !validateTcKimlik(form.tcKimlik)) {
      setError('Geçersiz TC Kimlik numarası')
      setLoading(false)
      return
    }

    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.fullName,
        dob: form.dob,
        tcKimlik: form.tcKimlik || undefined,
        school: form.school || undefined,
        address: form.address || undefined,
        groupId: form.groupId || undefined,
        monthlyFee: form.monthlyFee ? parseFloat(form.monthlyFee) : undefined,
        season: '2025-2026',
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      setLoading(false)
      return
    }

    router.push('/dashboard/students')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Yeni Öğrenci Kaydı</h1>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}

      <fieldset className="space-y-4">
        <legend className="font-semibold text-lg">Öğrenci Bilgileri</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
            <input type="text" required value={form.fullName} onChange={e => updateField('fullName', e.target.value)} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Doğum Tarihi *</label>
            <input type="date" required value={form.dob} onChange={e => updateField('dob', e.target.value)} className="w-full border rounded-lg p-2" />
          </div>
        </div>

        {suggestedCategory && (
          <div className="bg-blue-50 text-blue-700 p-2 rounded text-sm">
            Önerilen kategori: <strong>{AGE_CATEGORY_LABELS[suggestedCategory as AgeCategory]}</strong>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
          <input type="text" maxLength={11} value={form.tcKimlik} onChange={e => updateField('tcKimlik', e.target.value)} className="w-full border rounded-lg p-2" placeholder="11 haneli" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Okul</label>
            <input type="text" value={form.school} onChange={e => updateField('school', e.target.value)} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adres</label>
            <input type="text" value={form.address} onChange={e => updateField('address', e.target.value)} className="w-full border rounded-lg p-2" />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-semibold text-lg">Grup & Aidat</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Grup</label>
            <select value={form.groupId} onChange={e => updateField('groupId', e.target.value)} className="w-full border rounded-lg p-2">
              <option value="">Seçiniz</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.sports?.name} — {g.name} ({AGE_CATEGORY_LABELS[g.age_category as AgeCategory] ?? g.age_category})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Aylık Aidat (TL)</label>
            <input type="number" step="0.01" value={form.monthlyFee} onChange={e => updateField('monthlyFee', e.target.value)} className="w-full border rounded-lg p-2" />
          </div>
        </div>
      </fieldset>

      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-lg border hover:bg-gray-50">İptal</button>
      </div>
    </form>
  )
}
