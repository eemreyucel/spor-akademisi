'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Enrollment {
  id: string
  student_name: string
  group_name: string
  monthly_fee: number
}

export function CreatePaymentForm({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

  const [form, setForm] = useState({
    enrollment_id: '',
    amount: '',
    due_date: '',
    period_month: '',
    notes: '',
  })

  useEffect(() => {
    async function loadEnrollments() {
      const { data } = await supabase
        .from('enrollments')
        .select('id, monthly_fee, students(full_name), groups(name)')
        .eq('status', 'active')

      if (data) {
        setEnrollments(data.map((e: Record<string, unknown>) => ({
          id: e.id as string,
          student_name: (e.students as { full_name: string } | null)?.full_name ?? '',
          group_name: (e.groups as { name: string } | null)?.name ?? '',
          monthly_fee: (e.monthly_fee as number) ?? 0,
        })))
      }
    }
    loadEnrollments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleEnrollmentChange(enrollmentId: string) {
    const enrollment = enrollments.find(e => e.id === enrollmentId)
    setForm(prev => ({
      ...prev,
      enrollment_id: enrollmentId,
      amount: enrollment ? String(enrollment.monthly_fee) : prev.amount,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      setLoading(false)
      return
    }

    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Yeni Ödeme Oluştur</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Öğrenci / Grup *</label>
            <select
              required
              value={form.enrollment_id}
              onChange={e => handleEnrollmentChange(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            >
              <option value="">Seçiniz</option>
              {enrollments.map(e => (
                <option key={e.id} value={e.id}>
                  {e.student_name} — {e.group_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tutar (TL) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.amount}
                onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dönem (YYYY-MM) *</label>
              <input
                type="month"
                required
                value={form.period_month}
                onChange={e => setForm(prev => ({ ...prev, period_month: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Son Ödeme Tarihi *</label>
            <input
              type="date"
              required
              value={form.due_date}
              onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Not</label>
            <input
              type="text"
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="Opsiyonel"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Oluştur'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
