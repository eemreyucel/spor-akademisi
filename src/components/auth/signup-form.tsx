'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export function SignupForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [inviteRole, setInviteRole] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setValidating(false)
      return
    }

    async function validateToken() {
      const res = await fetch(`/api/invitations/validate?token=${token}`)
      if (res.ok) {
        const data = await res.json()
        setTokenValid(true)
        setInviteRole(data.role)
        if (data.email) setEmail(data.email)
      } else {
        const data = await res.json()
        setError(data.error)
      }
      setValidating(false)
    }

    validateToken()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, fullName, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      setLoading(false)
      return
    }

    // Sign in after successful registration
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  if (validating) {
    return (
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold">Acro & Art Studio</h1>
        <p className="text-gray-500 text-sm mt-2">Davet doğrulanıyor...</p>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm text-center space-y-4">
        <h1 className="text-2xl font-bold">Acro & Art Studio</h1>
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg text-sm">
          Kayıt olmak için bir davet linkiniz olması gerekiyor. Lütfen yöneticinizle iletişime geçin.
        </div>
        <p className="text-sm text-gray-500">
          Zaten hesabın var mı? <a href="/login" className="text-blue-600 hover:underline">Giriş Yap</a>
        </p>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="w-full max-w-sm text-center space-y-4">
        <h1 className="text-2xl font-bold">Acro & Art Studio</h1>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
          {error || 'Geçersiz davet linki'}
        </div>
        <p className="text-sm text-gray-500">
          Zaten hesabın var mı? <a href="/login" className="text-blue-600 hover:underline">Giriş Yap</a>
        </p>
      </div>
    )
  }

  const roleLabel = inviteRole === 'admin' ? 'Yönetici' : inviteRole === 'coach' ? 'Antrenör' : 'Veli'

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <h1 className="text-2xl font-bold text-center">Acro & Art Studio</h1>
      <p className="text-center text-gray-500 text-sm -mt-2">Kayıt Ol</p>

      <div className="bg-blue-50 text-blue-700 p-3 rounded text-sm text-center">
        <span className="font-medium">{roleLabel}</span> olarak davet edildiniz
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>
      )}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-1">Ad Soyad</label>
        <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full border rounded-lg p-2" />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">E-posta</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border rounded-lg p-2" />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Şifre</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full border rounded-lg p-2" />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded-lg p-2 font-medium hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Zaten hesabın var mı? <a href="/login" className="text-blue-600 hover:underline">Giriş Yap</a>
      </p>
    </form>
  )
}
