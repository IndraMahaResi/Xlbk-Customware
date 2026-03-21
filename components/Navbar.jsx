'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Efek untuk mendeteksi scroll agar efek kaca (glassmorphism) lebih dinamis
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Beranda', href: '/' },
    { name: 'Produk', href: '/products' },
    { name: 'Cara Order', href: '/how-to-order' },
    { name: 'Kontak', href: '/contact' },
  ]

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-900/70 backdrop-blur-lg border-b border-slate-700/50 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20"> {/* Tinggi navbar sedikit dilebarkan (h-20) untuk kesan premium */}

          {/* LOGO */}
          <Link
            href="/"
            className="text-2xl font-extrabold bg-gradient-to-r from-slate-100 to-blue-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            XLBK Customwear
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-semibold tracking-wide transition-all duration-300
                    ${
                      isActive
                        ? 'text-blue-400' // Warna aktif (Fintech Blue)
                        : 'text-slate-300 hover:text-blue-400'
                    }`}
                >
                  {item.name}
                  {/* Indikator titik di bawah menu aktif */}
                  {isActive && (
                    <span className="block w-full h-0.5 bg-blue-500 rounded-full mt-1 animate-pulse"></span>
                  )}
                </Link>
              )
            })}

            {/* Tombol CTA Desktop */}
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/50
              text-blue-400 font-semibold text-sm
              hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]
              transition-all duration-300"
            >
              Dashboard
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU - Dropdown transparan */}
      <div 
        className={`md:hidden absolute w-full transition-all duration-300 origin-top overflow-hidden ${
          isOpen ? 'max-h-[400px] border-b border-slate-700/50 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-slate-900/95 backdrop-blur-xl px-6 py-4 space-y-4 shadow-2xl">
          {navigation.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block text-base font-medium transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-300 hover:text-blue-400'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            )
          })}

          <div className="pt-4 border-t border-slate-800">
            <Link
              href="/dashboard"
              className="block w-full py-3 text-center rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}