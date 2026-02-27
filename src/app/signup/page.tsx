import { Suspense } from 'react'
import { SignupForm } from '@/components/auth/signup-form'

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={
        <div className="text-center">
          <h1 className="text-2xl font-bold">Acro & Art Studio</h1>
          <p className="text-gray-500 text-sm mt-2">Yükleniyor...</p>
        </div>
      }>
        <SignupForm />
      </Suspense>
    </main>
  )
}
