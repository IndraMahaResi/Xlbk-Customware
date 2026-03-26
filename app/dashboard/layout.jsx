'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon // 🔥 Import ikon untuk Register
} from '@heroicons/react/24/outline'

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)

    const token = localStorage.getItem('token')
    const userString = localStorage.getItem('user')

    if (!token || !userString || userString === 'undefined') {
      console.warn("Sesi tidak ditemukan, mengalihkan ke login...")
      localStorage.clear()
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      router.replace('/login')
    } else {
      try {
        const userData = JSON.parse(userString)
        setUser(userData)
      } catch (e) {
        localStorage.clear()
        router.replace('/login')
      }
    }
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = '/login'
  }

  // 🔥 Menu Navigasi
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Manajemen Pesanan', href: '/dashboard/orders', icon: ShoppingBagIcon },
    { name: 'Katalog Produk', href: '/dashboard/products', icon: CubeIcon },
    { name: 'Testimoni', href: '/dashboard/testimonials', icon: ChatBubbleLeftRightIcon },
    { name: 'Register Akun', href: '/register', icon: UserPlusIcon }, // 🔥 Menu Baru
  ]

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 text-xs font-bold tracking-[0.2em] uppercase">Memverifikasi Sesi</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 hidden md:flex flex-col z-30">
        <div className="h-20 flex items-center px-8 border-b border-slate-800/50">
          <Link href="/dashboard" className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
            XLBK<span className="text-white font-light">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                }`}
              >
                <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                <span className="text-sm font-semibold">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all duration-300"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="md:ml-64 flex flex-col min-h-screen relative z-10">
        
        {/* TOPBAR */}
        <header className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <h2 className="font-bold text-slate-100">Workspace</h2>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/50 py-1.5 px-3 rounded-full border border-slate-800 shadow-inner">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-100 leading-tight">{user.name}</p>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{user.role || 'Super Admin'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="p-8 flex-1">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <footer className="p-8 border-t border-slate-800/50 text-center">
          <p className="text-xs text-slate-600 font-medium tracking-widest uppercase">
            XLBK Internal System © {new Date().getFullYear()}
          </p>
        </footer>
      </div>

      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
    </div>
  )
}