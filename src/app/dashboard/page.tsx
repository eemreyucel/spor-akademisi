import { getUserProfile } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Hoş Geldiniz, {profile.fullName}</h1>
      <p className="text-gray-500">Sol menüden bir bölüm seçin.</p>
    </div>
  )
}
