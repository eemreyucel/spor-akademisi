'use client'

import { useState, useEffect } from 'react'

interface Student {
  id: string
  full_name: string
}

interface Invitation {
  id: string
  token: string
  role: string
  email: string | null
  student_id: string | null
  expires_at: string
  used_at: string | null
  created_at: string
}

export function InviteForm() {
  const [role, setRole] = useState<'admin' | 'coach' | 'parent'>('coach')
  const [email, setEmail] = useState('')
  const [studentId, setStudentId] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchInvitations()
    fetchStudents()
  }, [])

  async function fetchStudents() {
    const res = await fetch('/api/students')
    if (res.ok) {
      const data = await res.json()
      setStudents(data.students ?? [])
    }
  }

  async function fetchInvitations() {
    const res = await fetch('/api/invitations')
    if (res.ok) {
      const data = await res.json()
      setInvitations(data.invitations ?? [])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role,
        email: email || undefined,
        studentId: role === 'parent' && studentId ? studentId : undefined,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      setLoading(false)
      return
    }

    setEmail('')
    setStudentId('')
    setLoading(false)
    fetchInvitations()
  }

  function getInviteLink(token: string) {
    return `${window.location.origin}/signup?token=${token}`
  }

  async function copyLink(token: string, id: string) {
    await navigator.clipboard.writeText(getInviteLink(token))
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu daveti silmek istediğinize emin misiniz?')) return
    await fetch(`/api/invitations/${id}`, { method: 'DELETE' })
    fetchInvitations()
  }

  function getStatus(inv: Invitation) {
    if (inv.used_at) return { label: 'Kullanıldı', className: 'bg-gray-100 text-gray-600' }
    if (new Date(inv.expires_at) < new Date()) return { label: 'Süresi Doldu', className: 'bg-red-100 text-red-600' }
    return { label: 'Aktif', className: 'bg-green-100 text-green-700' }
  }

  return (
    <div className="space-y-6">
      {/* Create Invitation Form */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Yeni Davet Oluştur</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'coach' | 'parent')}
              className="w-full border rounded-lg p-2"
            >
              <option value="admin">Yönetici</option>
              <option value="coach">Antrenör</option>
              <option value="parent">Veli</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">E-posta (opsiyonel)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Belirli bir kişiye davet göndermek için"
              className="w-full border rounded-lg p-2"
            />
          </div>

          {role === 'parent' && (
            <div>
              <label className="block text-sm font-medium mb-1">Öğrenci (opsiyonel)</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Seçiniz</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Oluşturuluyor...' : 'Davet Oluştur'}
          </button>
        </form>
      </div>

      {/* Invitations List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Rol</th>
              <th className="text-left p-3 font-medium">E-posta</th>
              <th className="text-left p-3 font-medium">Durum</th>
              <th className="text-left p-3 font-medium">Oluşturulma</th>
              <th className="text-left p-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map(inv => {
              const status = getStatus(inv)
              return (
                <tr key={inv.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                      {inv.role === 'admin' ? 'Yönetici' : inv.role === 'coach' ? 'Antrenör' : 'Veli'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{inv.email ?? '—'}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(inv.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {!inv.used_at && new Date(inv.expires_at) >= new Date() && (
                        <button
                          onClick={() => copyLink(inv.token, inv.id)}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          {copiedId === inv.id ? 'Kopyalandı!' : 'Linki Kopyala'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {invitations.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-gray-400">Henüz davet yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
