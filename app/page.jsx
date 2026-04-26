'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import TestimonialCard from '@/components/TestimonialCard'
import Link from 'next/link'
import Image from 'next/image'

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
  const [hasilKarya, setHasilKarya] = useState([])
  const [promos, setPromos] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [testimonials, setTestimonials] = useState([])
  const [featuredTestimonials, setFeaturedTestimonials] = useState([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(true)
  const [showBanner, setShowBanner] = useState(true)
  
  // 🟢 STATE BARU: Menyimpan item yang di-klik untuk di-zoom (Modal)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTestimonialsLoading(true)
        const [prodRes, karyaRes, promoRes, setRes, testRes, featTestRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/hasil-karya'),
          fetch('/api/promo'),
          fetch('/api/settings'),
          fetch('/api/testimonials?approved=true'),
          fetch('/api/testimonials?featured=true')
        ])

        if (prodRes.ok) {
          const prodData = await prodRes.json()
          setProducts(prodData.slice(0, 6))
        }
        
        if (karyaRes.ok) {
          const karyaData = await karyaRes.json()
          setHasilKarya(karyaData.slice(0, 8))
        }

        if (promoRes.ok) setPromos(await promoRes.json())
        if (setRes.ok) setSettings(await setRes.json())
        
        if (testRes.ok) {
          const testData = await testRes.json()
          setTestimonials(testData.slice(0, 6))
        }

        if (featTestRes.ok) {
          const featData = await featTestRes.json()
          setFeaturedTestimonials(featData.slice(0, 3))
        }

      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
        setTestimonialsLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      <Navbar />

      {/* 🟢 TOP PROMO BANNER (Dinamis dari Settings) */}
      {settings?.promoActive && showBanner && (
        <div className="fixed top-20 inset-x-0 z-[60] px-4 md:px-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="max-w-5xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1 overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-blue-600/10 flex items-center justify-between px-4 py-3 md:px-8">
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex w-10 h-10 rounded-xl bg-blue-600/20 items-center justify-center text-xl animate-pulse">
                    🚀
                  </div>
                  <div className="flex flex-col">
                    <p className="text-white text-sm md:text-base font-bold tracking-tight">
                      {settings.promoMessage}
                    </p>
                    <p className="text-blue-400 text-[10px] uppercase font-black tracking-[0.2em]">
                      Limited Time Offer
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {settings.promoLink && (
                    <Link
                      href={settings.promoLink}
                      className="relative inline-flex items-center justify-center px-5 py-2 overflow-hidden font-bold text-white transition-all duration-300 bg-blue-600 rounded-xl group/btn hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></span>
                      <span className="relative text-xs md:text-sm">
                        {settings.promoButtonText || "Ambil Sekarang"}
                      </span>
                    </Link>
                  )}
                  <button
                    onClick={() => setShowBanner(false)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="h-[2px] w-full bg-slate-800">
                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 animate-gradient-x"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section
        className={`relative min-h-[90vh] flex items-center justify-center overflow-hidden z-10 ${!settings?.promoActive ? "pt-20" : ""}`}
      >
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        ></div>

        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950 via-slate-950/50 to-slate-950"></div>
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-blue-500/30 text-blue-400 text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(37,99,235,0.15)]">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Borderless Custom Merchandise
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-blue-400 drop-shadow-lg leading-tight">
            Wujudkan Desainmu, <br className="hidden md:block" />
            Bayar Tanpa Batasan.
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Platform cetak merchandise premium pertama yang mendukung pembayaran
            fiat dan{" "}
            <span className="text-white font-bold border-b border-blue-500">
              Cryptocurrency
            </span>
            . Mulai dari satuan hingga partai besar.
          </p>

          <div className="flex justify-center gap-4 flex-wrap mb-10">
            <Link
              href="/products"
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all duration-300 font-bold text-white shadow-glow flex items-center gap-2"
            >
              Mulai Custom Sekarang
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
            <Link
              href="/products"
              className="px-8 py-4 rounded-xl border border-slate-600 bg-slate-900/60 backdrop-blur-md hover:bg-slate-800 hover:border-slate-500 text-slate-200 transition-all duration-300 font-bold"
            >
              Lihat Katalog
            </Link>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="relative z-20 -mt-16 mb-24 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-center">
          {[
            {
              num: "Fleksibel",
              label: "Bebas Minimum Order",
              desc: "Satu pcs pun kami kerjakan dengan kualitas terbaik.",
            },
            {
              num: "Secure Pay",
              label: "Crypto & Fiat Ready",
              desc: "Transaksi aman, cepat, dan transparan via USDT/BTC.",
            },
            {
              num: "Presisi",
              label: "Quality Control Ketat",
              desc: "Hasil cetak tajam sesuai dengan desain asli Anda.",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-xl shadow-2xl hover:-translate-y-1 hover:border-blue-500/30 transition-all duration-300"
            >
              <h3 className="text-2xl font-extrabold text-slate-100 mb-2">
                {stat.num}
              </h3>
              <p className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-3">
                {stat.label}
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 🟢 SECTION: PROMO & EVENT TERBARU (Horizontal Scroll / Slider) */}
      {promos.length > 0 && (
        <section className="py-20 relative z-10 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Event & Promo
                </h2>
                <div className="w-12 h-1 bg-rose-500 rounded-full"></div>
              </div>
            </div>

            {/* Wrapper Slider Horizontal */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {promos.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedItem(p)} // 🟢 Fungsi Klik memanggil Modal
                  className="shrink-0 snap-center w-[85vw] sm:w-[350px] md:w-[400px] group relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-rose-500/50 transition-all shadow-xl cursor-pointer"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={p.imageUrl}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {p.badge && (
                      <span className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-lg">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {p.title}
                    </h3>
                    {p.description && (
                      <p className="text-slate-400 text-sm line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 🟢 SECTION: HASIL KARYA (Horizontal Scroll / Slider) */}
      {hasilKarya.length > 0 && (
        <section className="py-24 relative z-10 border-t border-slate-800/50 bg-slate-900/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center mb-14 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
                Hasil Karya Kami
              </h2>
              <div className="w-20 h-1 bg-blue-600 rounded-full mx-auto"></div>
              <p className="mt-4 text-slate-400 max-w-xl">
                Geser untuk melihat portofolio produksi terbaik yang telah kami
                kerjakan.
              </p>
            </div>

            {/* Wrapper Slider Horizontal */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-8 -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {hasilKarya.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem({ ...item, badge: null })} // 🟢 Fungsi Klik memanggil Modal
                  className="shrink-0 snap-center w-[60vw] sm:w-[250px] md:w-[280px] group relative rounded-2xl overflow-hidden aspect-square bg-slate-800 border border-slate-700 cursor-pointer"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-sm md:text-base leading-tight">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-slate-300 text-[11px] mt-1 line-clamp-2 hidden sm:block">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES SECTION */}
      <section className="py-24 relative z-10 border-t border-slate-800/50 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center mb-14 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
              Pilih Base Produk Anda
            </h2>
            <div className="w-20 h-1 bg-blue-600 rounded-full"></div>
            <p className="mt-4 text-slate-400 max-w-xl">
              Dari apparel premium hingga souvenir eksklusif.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.keys(CategoryIcons).map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${cat}`}
                className="group flex flex-col items-center justify-center p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl hover:bg-slate-800/80 hover:border-blue-500/50 transition-all"
              >
                <div className="text-slate-400 group-hover:text-blue-400 mb-4 transition-colors">
                  {CategoryIcons[cat]}
                </div>
                <h3 className="text-sm font-semibold text-slate-200">{cat}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOG SECTION */}
      <section className="py-24 relative z-10 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4 text-center md:text-left">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
                Katalog Terpopuler
              </h2>
              <div className="w-20 h-1 bg-blue-600 rounded-full mx-auto md:mx-0"></div>
            </div>
            <Link
              href="/products"
              className="text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center gap-2"
            >
              Lihat Semua <span>→</span>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-slate-900 animate-pulse rounded-3xl border border-slate-800"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 relative z-10 border-t border-slate-800/50 bg-slate-900/20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-14 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
              Apa Kata Mereka?
            </h2>
            <div className="w-20 h-1 bg-blue-600 rounded-full"></div>
          </div>

          {featuredTestimonials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {featuredTestimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} featured={true} />
              ))}
            </div>
          )}

          {testimonialsLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================
          CTA SECTION - Crypto Focused Card
          ========================================= */}
      <section className="py-24 relative z-10 px-6 border-t border-slate-800/50 bg-slate-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-slate-800/50 border border-slate-700/50 p-10 md:p-16 text-center shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-slate-800/50 to-[#26A17B]/10 pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-100">
                Siap Mencetak Ide Anda?
              </h2>

              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Kami menangani pesanan satuan hingga pengadaan B2B partai besar.
                Fleksibel, cepat, dan menerima pembayaran global melalui{" "}
                <span className="text-[#F7931A] font-bold">Bitcoin</span> maupun{" "}
                <span className="text-[#26A17B] font-bold">USDT Tether</span>.
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

      {/* 🟢 MODAL ZOOM IMAGE (Untuk Promo & Hasil Karya) */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedItem(null)} 
        >
          <div 
            className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Tombol Close */}
            <button 
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors shadow-lg"
              onClick={() => setSelectedItem(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Gambar Besar */}
            <div className="relative w-full flex-1 min-h-[40vh] md:min-h-[50vh] bg-slate-950/50 flex items-center justify-center">
              <Image 
                src={selectedItem.imageUrl} 
                alt={selectedItem.title} 
                fill 
                className="object-contain" 
              />
              {selectedItem.badge && (
                <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs sm:text-sm font-black px-4 py-1.5 rounded-full uppercase shadow-lg">
                  {selectedItem.badge}
                </span>
              )}
            </div>
            
            {/* Teks Deskripsi */}
            <div className="p-6 md:p-8 bg-slate-900 border-t border-slate-800 shrink-0 overflow-y-auto">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">{selectedItem.title}</h3>
              {selectedItem.description ? (
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {selectedItem.description}
                </p>
              ) : (
                <p className="text-slate-500 italic text-sm">Tidak ada deskripsi tambahan.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}