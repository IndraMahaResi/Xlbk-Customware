'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'

// SVG Icons untuk Kategori Produk
const CategoryIcons = {
  SOUVENIR: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
  ),
  MUG: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  TUMBLER: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
  ),
  TOTEBAG: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
  ),
  KAOS: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
  ),
  BAJU: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
  )
};

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (data.length === 0) {
          setProducts([]);
      } else {
          setProducts(data.slice(0, 6))
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([]);
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      {/* HERO SECTION - Web3 / Fintech Vibe */}
      <section className="pt-28 pb-16 relative overflow-hidden z-10">
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          
          {/* Badge / Label modern dengan sentuhan Crypto */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Borderles Custom Merchandise
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-blue-100 to-blue-400">
            Wujudkan Desainmu, <br className="hidden md:block" />
            Bayar Tanpa Batasan.
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Platform cetak merchandise premium pertama yang mendukung pembayaran fiat dan <span className="text-slate-200 font-semibold">Cryptocurrency</span>. Mulai dari satuan hingga partai besar, proses cepat dan presisi.
          </p>

          <div className="flex justify-center gap-4 flex-wrap mb-10">
            <Link
              href="/products"
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 
              transition-all duration-300 font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] flex items-center gap-2"
            >
              Mulai Custom Sekarang
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <Link
              href="/products"
              className="px-8 py-4 rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm
              hover:bg-slate-700 hover:border-slate-600 text-slate-200 transition-all duration-300 font-bold"
            >
              Lihat Katalog
            </Link>
          </div>

          {/* Supported Payments Strip */}
          <div className="flex flex-col items-center justify-center gap-4 mb-20 opacity-80">
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Supported Payments</p>
            <div className="flex items-center gap-6 text-slate-400">
              {/* Bank Transfer / QRIS */}
              <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                <span className="font-bold text-lg">QRIS</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
              {/* Bitcoin */}
              <div className="flex items-center gap-1.5 hover:text-[#F7931A] transition-colors cursor-pointer" title="Bitcoin Accepted">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M14.077 10.278c1.076-.23 1.884-.852 1.884-2.181 0-1.853-1.464-2.458-3.56-2.458H10.15V2h-1.87v3.639H6.942V2h-1.87v3.639H2v1.87h1.411c.883 0 1.25.437 1.25 1.118v7.243c0 .351-.122.846-1.01.846H2v1.87h3.082v3.744h1.87v-3.744h1.338v3.744h1.87v-3.744c2.616 0 4.316-.763 4.316-3.085 0-1.503-1.042-2.441-2.399-2.614zm-2.584-2.903h1.498c.845 0 1.543.344 1.543 1.157 0 .863-.787 1.178-1.543 1.178h-1.498V7.375zm1.751 7.424h-1.751v-2.348h1.751c.969 0 1.77.382 1.77 1.222 0 .839-.81 1.126-1.77 1.126z"/></svg>
                <span className="font-bold text-lg tracking-wide">BTC</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
              {/* USDT Tether */}
              <div className="flex items-center gap-1.5 hover:text-[#26A17B] transition-colors cursor-pointer" title="Tether USDT Accepted">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zM13.682 10.42v6.23h-3.364v-6.23H6.077V7.124h11.846v3.296h-4.241z"/></svg>
                <span className="font-bold text-lg tracking-wide">USDT</span>
              </div>
            </div>
          </div>

          {/* STATS - Glassmorphism Cards (Updated Copy) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
            {[
              { num: 'Fleksibel', label: 'Bebas Minimum Order', desc: 'Satu pcs pun kami kerjakan dengan kualitas terbaik.' },
              { num: 'Secure Pay', label: 'Crypto & Fiat Ready', desc: 'Transaksi aman, cepat, dan transparan via USDT/BTC.' },
              { num: 'Presisi', label: 'Quality Control Ketat', desc: 'Hasil cetak tajam sesuai dengan desain asli Anda.' }
            ].map((stat, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-md hover:bg-slate-800/50 transition-colors">
                <h3 className="text-2xl font-bold text-slate-100 mb-1">{stat.num}</h3>
                <p className="text-blue-400 font-semibold text-sm uppercase tracking-wider mb-2">{stat.label}</p>
                <p className="text-slate-400 text-sm">{stat.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-24 relative z-10 border-t border-slate-800/50 bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
              Pilih Base Produk Anda
            </h2>
            <div className="w-20 h-1 bg-blue-600 rounded-full"></div>
            <p className="mt-4 text-slate-400 text-center max-w-xl">
                Dari apparel premium hingga souvenir eksklusif. Siapkan desain Anda dan biarkan kami yang mengeksekusinya.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['KAOS', 'MUG', 'TUMBLER', 'TOTEBAG', 'BAJU', 'SOUVENIR'].map((category) => (
              <Link
                key={category}
                href={`/products?category=${category}`}
                className="group flex flex-col items-center justify-center p-6 bg-slate-800/30 border border-slate-700/50
                rounded-2xl hover:bg-slate-800/80 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-slate-400 group-hover:text-blue-400 mb-4 transition-colors duration-300">
                    {CategoryIcons[category] || CategoryIcons['SOUVENIR']}
                </div>
                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-slate-100 mb-1 transition-colors">
                  {category}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="py-24 relative z-10 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
              Katalog Terpopuler
            </h2>
            <div className="w-20 h-1 bg-blue-600 rounded-full"></div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-slate-700 bg-slate-800/30
              text-blue-400 hover:bg-blue-600 hover:border-blue-500 hover:text-white
              transition-all duration-300 font-medium"
            >
              Eksplorasi Semua Produk
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA SECTION - Crypto Focused Card */}
      <section className="py-24 relative z-10 px-6 border-t border-slate-800/50 bg-slate-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-slate-800/50 border border-slate-700/50 p-10 md:p-16 text-center shadow-2xl backdrop-blur-sm">
            
            {/* Inner Glow - Greenish/Blueish for Crypto Vibe */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-slate-800/50 to-[#26A17B]/10 pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-100">
                Siap Mencetak Ide Anda?
              </h2>
              
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Kami menangani pesanan satuan hingga pengadaan B2B partai besar. Fleksibel, cepat, dan menerima pembayaran global melalui <span className="text-[#F7931A] font-bold">Bitcoin</span> maupun <span className="text-[#26A17B] font-bold">USDT Tether</span>.
              </p>

              <div className="flex justify-center gap-4 flex-wrap">
                <Link
                  href="/products"
                  className="inline-block px-10 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                  Order Sekarang
                </Link>
                <Link
                  href="/contact"
                  className="inline-block px-10 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors border border-slate-600"
                >
                  Hubungi Sales (B2B)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}