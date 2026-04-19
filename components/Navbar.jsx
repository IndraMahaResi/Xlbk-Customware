'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Efek untuk mendeteksi scroll agar efek kaca (glassmorphism) dinamis
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
          ? 'bg-slate-950/80 backdrop-blur-lg border-b border-slate-800 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20"> 

          {/* LOGO */}
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-400 hover:scale-105 transition-transform drop-shadow-md"
          >
            XLBK Customwear<span className="text-blue-500">.</span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href

              return (
                <div key={item.name} className="relative flex flex-col items-center justify-center">
                  <Link
                    href={item.href}
                    className={`text-sm font-semibold tracking-wide transition-all duration-300 py-2
                      ${isActive ? 'text-blue-400' : 'text-slate-300 hover:text-blue-400'}
                    `}
                  >
                    {item.name}
                  </Link>
                  {/* Indikator titik di bawah menu aktif */}
                  {isActive && (
                    <span className="absolute bottom-0 w-1/2 h-0.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                  )}
                </div>
              )
            })}

            {/* Tombol CTA Desktop */}
            <div className="flex items-center gap-4 pl-4 border-l border-slate-700/50">
              
              {/* Tombol Cek Tagihan / Pelunasan (Bisa diakses semua pelanggan) */}
              <Link
                href="/pelunasan"
                className="px-5 py-2 rounded-xl bg-slate-800/80 border border-slate-700
                text-slate-200 font-bold text-sm
                hover:bg-slate-700 hover:text-white hover:border-slate-500
                transition-all duration-300"
              >
                Cek Tagihan
              </Link>

              {/* Tombol Order untuk Customer */}
              <Link
                href="/products"
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all duration-300"
              >
                Order Sekarang
              </Link>
            </div>
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

      {/* MOBILE MENU - Dropdown */}
      <div 
        className={`md:hidden absolute w-full transition-all duration-300 origin-top overflow-hidden ${
          isOpen ? 'max-h-[500px] border-b border-slate-800 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-slate-950/95 backdrop-blur-2xl px-6 py-6 space-y-5 shadow-2xl">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block text-base font-semibold transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-300 hover:text-blue-400'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            )
          })}

          <div className="pt-6 border-t border-slate-800 flex flex-col gap-3">
            <Link
              href="/products"
              className="block w-full py-3.5 text-center rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              onClick={() => setIsOpen(false)}
            >
              Order Sekarang
            </Link>

            {/* Tombol Pelunasan Mobile */}
            <Link
              href="/pelunasan"
              className="block w-full py-3.5 text-center rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold hover:bg-slate-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Cek Tagihan / Pelunasan
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}