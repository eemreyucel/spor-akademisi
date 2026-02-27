'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@/lib/auth/get-user-roles'

interface NavItem {
  href: string
  label: string
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Ana Sayfa', roles: ['admin', 'coach', 'parent'] },
  { href: '/dashboard/students', label: 'Öğrenciler', roles: ['admin'] },
  { href: '/dashboard/groups', label: 'Gruplar', roles: ['admin'] },
  { href: '/dashboard/attendance', label: 'Yoklama', roles: ['admin', 'coach'] },
  { href: '/dashboard/payments', label: 'Ödemeler', roles: ['admin', 'parent'] },
  { href: '/dashboard/conflicts', label: 'Çakışmalar', roles: ['admin'] },
]

export function Sidebar({ roles, fullName }: { roles: UserRole[]; fullName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const visibleItems = navItems.filter(item =>
    item.roles.some(r => roles.includes(r))
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg">Spor Akademisi</h2>
        <p className="text-sm text-gray-500">{fullName}</p>
        <div className="flex gap-1 mt-1">
          {roles.map(role => (
            <span key={role} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {role === 'admin' ? 'Yönetici' : role === 'coach' ? 'Antrenör' : 'Veli'}
            </span>
          ))}
        </div>
      </div>

      <nav className="flex-1 p-2">
        {visibleItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-lg text-sm ${
              pathname === item.href
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
