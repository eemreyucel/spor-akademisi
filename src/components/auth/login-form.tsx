'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <h1 className="text-2xl font-bold text-center">Acro & Art Studio</h1>
      <p className="text-center text-gray-500 text-sm -mt-2">Giriş Yap</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">E-posta</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border rounded-lg p-2" />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Şifre</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border rounded-lg p-2" />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded-lg p-2 font-medium hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </button>

      <p className="text-center text-sm text-gray-400">
        Kayıt olmak için yöneticinizden davet linki alın.
      </p>
    </form>
  )
}
