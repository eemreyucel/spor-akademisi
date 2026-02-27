import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/get-user-roles'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getUserProfile()

  if (!profile) redirect('/login')
  if (profile.roles.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Hesabınıza henüz bir rol atanmamış. Yönetici ile iletişime geçin.</p>
      </main>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar roles={profile.roles} fullName={profile.fullName} />
      <main className="flex-1 p-4 md:p-6 pt-18 md:pt-6">{children}</main>
    </div>
  )
}
