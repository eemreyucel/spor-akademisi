'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
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
  { href: '/dashboard/invitations', label: 'Davetiyeler', roles: ['admin'] },
]

export function Sidebar({ roles, fullName }: { roles: UserRole[]; fullName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const visibleItems = navItems.filter(item =>
    item.roles.some(r => roles.includes(r))
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-40 flex items-center justify-between px-4 h-14">
        <h2 className="font-bold">Acro & Art Studio</h2>
        <button onClick={() => setOpen(!open)} className="p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-50 bg-white border-r w-64 flex flex-col
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">Acro & Art Studio</h2>
          <p className="text-sm text-gray-500">{fullName}</p>
          <div className="flex gap-1 mt-1">
            {roles.map(role => (
              <span key={role} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {role === 'admin' ? 'Yönetici' : role === 'coach' ? 'Antrenör' : 'Veli'}
              </span>
            ))}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {visibleItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
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
    </>
  )
}
