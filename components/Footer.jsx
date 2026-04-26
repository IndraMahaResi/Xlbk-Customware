'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error(err))
  }, [])

  const waNumber = settings?.whatsapp || '6281283433771'
  const emailAddress = settings?.email || 'xlbk.customwear@gmail.com'
  const socials = settings?.socials || []
  const marketplaces = settings?.marketplaces || []

  // Fungsi Pembantu: Memilih Ikon berdasarkan Nama
  const renderIcon = (name) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('instagram')) return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
    if (lowerName.includes('shopee')) return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
    if (lowerName.includes('tokopedia')) return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>
    if (lowerName.includes('tiktok')) return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
    return <span className="font-bold text-xs">{name.charAt(0)}</span> // Fallback inisial
  }

  return (
    <footer className="bg-[#0B1120] border-t border-slate-800/50 pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="space-y-6">
            <Link href="/" className="inline-block text-2xl font-extrabold bg-gradient-to-r from-slate-100 to-blue-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              XLBK Customwear
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Platform custom merchandise premium. Melayani pembuatan kaos, mug, tumbler, dan souvenir tanpa minimum order. Mendukung pembayaran Fiat & Crypto.
            </p>
          </div>

          <div>
            <h3 className="text-slate-100 font-semibold mb-6 uppercase tracking-wider text-sm">Navigasi</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="/products" className="hover:text-blue-400 transition-colors flex items-center gap-2">Katalog Produk</Link></li>
              <li><Link href="/how-to-order" className="hover:text-blue-400 transition-colors">Panduan Pemesanan</Link></li>
              <li><Link href="/faq" className="hover:text-blue-400 transition-colors">Pertanyaan (FAQ)</Link></li>
              <li className="pt-2">
                <Link href="/dashboard" className="text-slate-600 hover:text-blue-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 inline-block transition-colors"></span> Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-100 font-semibold mb-6 uppercase tracking-wider text-sm">Hubungi Kami</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">Jl. Albasia 3 Perum Papan Indah No 29 Rt 09/RW 09,<br />Mangunjaya, Tambun Selatan,<br />Kab. Bekasi, Jawa Barat</span>
              </li>
              <li className="flex items-center gap-3">
                <EnvelopeIcon className="w-5 h-5 text-blue-500 shrink-0" />
                <a href={`mailto:${emailAddress}`} className="hover:text-blue-400 transition-colors">{emailAddress}</a>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-blue-500 shrink-0" />
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">+{waNumber}</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-100 font-semibold mb-6 uppercase tracking-wider text-sm">Temukan Kami</h3>
            <div className="flex flex-wrap gap-4">
              {/* Loop Dinamis Sosmed & Marketplace */}
              {[...socials, ...marketplaces].map((item, idx) => (
                <a key={idx} href={item.url} target="_blank" rel="noreferrer" title={item.name} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                  {renderIcon(item.name)}
                </a>
              ))}
              
              {/* Default Email Link */}
              <a href={`mailto:${emailAddress}`} title="Email" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]">
                <EnvelopeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {currentYear} XLBK Customwear. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="hover:text-slate-300 transition-colors cursor-default">Created by Indra Maha Resi</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
            <span className="hover:text-slate-300 transition-colors cursor-default">Made in Bekasi</span>
          </div>
        </div>

      </div>
    </footer>
  )
}