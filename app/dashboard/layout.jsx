'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user')

      if (!userData) {
        router.replace('/login') // 🔥 replace biar ga balik lagi
        return
      }

      const parsedUser = JSON.parse(userData)

      if (!parsedUser?.email) {
        localStorage.removeItem('user')
        router.replace('/login')
        return
      }

      setUser(parsedUser)
    } catch (err) {
      console.error('User parse error:', err)
      localStorage.removeItem('user')
      router.replace('/login')
    }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // 🔥 pastikan bersih total
      localStorage.removeItem('user')

      // fallback hapus cookie manual (kalau API gagal)
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

      router.replace('/login')
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBagIcon },
    { name: 'Products', href: '/dashboard/products', icon: CubeIcon },
    { name: 'Reports', href: '/dashboard/reports', icon: DocumentTextIcon },
  ]

  // 🔥 loading state clean (no flicker putih)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-slate-400">
        Loading dashboard...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex">

      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 shadow-2xl z-20 flex flex-col">

        <div className="flex items-center justify-center h-20 border-b border-slate-800">
          <Link
            href="/dashboard"
            className="text-xl font-extrabold bg-gradient-to-r from-slate-100 to-blue-400 bg-clip-text text-transparent"
          >
            XLBK Dashboard
          </Link>
        </div>

        <nav className="flex-1 mt-6 flex flex-col gap-2 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border-l-4 border-blue-500'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        <header className="sticky top-0 bg-slate-900/70 backdrop-blur-md border-b border-slate-800 h-20 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold">
            Selamat datang,{' '}
            <span className="text-blue-400">
              {user.name || 'User'}
            </span>
          </h2>

          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </header>

        <main className="flex-1 p-8">
          {children}
        </main>

      </div>
    </div>
  )
}