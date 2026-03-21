'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import {
  DocumentTextIcon,
  PencilSquareIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

export default function HowToOrder() {
  const [activeTab, setActiveTab] = useState('guide')

  const steps = [
    {
      number: 1,
      title: 'Pilih Produk Base',
      description: 'Pilih produk yang ingin Anda custom dari katalog kami. Tersedia berbagai pilihan seperti mug, tumbler, totebag, kaos, dan souvenir.',
      icon: DocumentTextIcon,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]'
    },
    {
      number: 2,
      title: 'Siapkan Desain',
      description: 'Siapkan file desain Anda dalam format JPG, PNG, PDF, atau AI. Pastikan resolusi minimal 300 DPI untuk hasil cetak yang maksimal.',
      icon: PencilSquareIcon,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
    },
    {
      number: 3,
      title: 'Upload & Konfigurasi',
      description: 'Upload desain Anda melalui form pemesanan, tentukan kuantitas, ukuran, dan spesifikasi tambahan, lalu lengkapi data pengiriman.',
      icon: DocumentTextIcon,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)]'
    },
    {
      number: 4,
      title: 'Pembayaran (Fiat/Crypto)',
      description: 'Lakukan pembayaran sesuai metode yang dipilih (Transfer Bank, QRIS, BTC, atau USDT) dan sistem akan memverifikasi otomatis.',
      icon: CreditCardIcon,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
    },
    {
      number: 5,
      title: 'Proses Produksi',
      description: 'Tim kami akan memvalidasi desain dan memulai produksi. Waktu pengerjaan biasanya 3-7 hari kerja tergantung antrean.',
      icon: TruckIcon,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
    },
    {
      number: 6,
      title: 'Pengiriman',
      description: 'Produk selesai akan dikemas aman dan dikirim ke alamat Anda. Nomor resi pelacakan akan dikirimkan ke email/dashboard Anda.',
      icon: CheckCircleIcon,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
    }
  ]

  const designTips = [
    {
      title: 'Resolusi Minimal 300 DPI',
      description: 'Pastikan desain Anda memiliki resolusi minimal 300 DPI untuk hasil cetak yang sangat tajam dan tidak pecah saat diaplikasikan ke media cetak.'
    },
    {
      title: 'Gunakan Format Vektor',
      description: 'Untuk hasil terbaik, terutama pada merchandise padat, gunakan format vektor seperti AI, EPS, atau PDF. Format ini memungkinkan penskalaan tanpa kehilangan kualitas.'
    },
    {
      title: 'Profil Warna CMYK',
      description: 'Warna di layar monitor (RGB) bisa berbeda dengan hasil cetak. Gunakan profil warna CMYK saat mendesain untuk akurasi warna fisik yang lebih presisi.'
    },
    {
      title: 'Perhatikan Area Aman (Safe Zone)',
      description: 'Pastikan elemen penting desain (seperti teks atau logo) berada di area aman dan tidak terlalu dekat dengan tepi potongan produk.'
    }
  ]

  const faqs = [
    {
      question: 'Berapa lama estimasi proses produksi?',
      answer: 'Proses produksi memakan waktu sekitar 3-7 hari kerja setelah desain disetujui dan pembayaran diverifikasi. Ini bisa bervariasi tergantung pada kerumitan cetak dan antrean produksi.'
    },
    {
      question: 'Apakah saya bisa meminta revisi desain yang sudah diupload?',
      answer: 'Jika pesanan masih berstatus "Pending" dan belum masuk tahap "Processing", Anda bisa menghubungi admin kami untuk mengubah file desain.'
    },
    {
      question: 'Bagaimana cara tracking pesanan saya?',
      answer: 'Setelah pesanan dikirim, status di dashboard Anda akan berubah, dan Anda bisa melihat resi pengiriman yang tertera untuk dilacak melalui kurir pilihan.'
    },
    {
      question: 'Apakah ada Minimum Order Quantity (MOQ)?',
      answer: 'Kami melayani pembuatan satuan (tanpa minimum order) untuk produk tertentu seperti Kaos dan Mug. Untuk harga grosir, minimal pesanan bervariasi per produk.'
    },
    {
      question: 'Apakah saya bisa mencetak sample terlebih dahulu?',
      answer: 'Tentu. Untuk pesanan partai besar (B2B), kami sangat menyarankan untuk mencetak 1 sample terlebih dahulu (dikenakan biaya normal). Jika disetujui, biaya sample bisa dipotongkan dari total tagihan pesanan massal.'
    }
  ]

  return (
    <>
      <Navbar />
      
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-blue-100 to-blue-400">
            Cara Melakukan Pemesanan
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Proses pemesanan transparan dan terstruktur. Ikuti panduan sederhana ini untuk mewujudkan merchandise impian Anda.
          </p>
        </div>
      </section>

      {/* Tabs Navigation - Modern Fintech Style */}
      <section className="relative z-10 mb-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center p-1.5 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 w-full sm:w-fit mx-auto">
            {[
              { id: 'guide', label: 'Panduan Order' },
              { id: 'tips', label: 'Tips Desain' },
              { id: 'faq', label: 'FAQ' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-24 relative z-10 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Guide Tab */}
          {activeTab === 'guide' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {steps.map((step) => {
                  const Icon = step.icon
                  return (
                    <div
                      key={step.number}
                      className="group bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-8 relative hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div className="absolute -top-4 -right-4 text-7xl font-extrabold text-slate-700/20 group-hover:text-blue-500/10 transition-colors pointer-events-none">
                        0{step.number}
                      </div>
                      
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 border ${step.color} transition-colors`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition-colors">
                        {step.title}
                      </h3>
                      
                      <p className="text-slate-400 leading-relaxed text-sm">
                        {step.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tips Tab */}
          {activeTab === 'tips' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {designTips.map((tip, index) => (
                  <div key={index} className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-8 hover:border-blue-500/30 transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">{tip.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* File Format Guide */}
              <div className="bg-slate-900/60 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none"></div>
                <h3 className="text-xl font-bold text-slate-100 mb-8 text-center">Format File yang Didukung</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 relative z-10">
                  {[
                    { format: 'JPG', icon: '🖼️' },
                    { format: 'PNG', icon: '🎨' },
                    { format: 'PDF', icon: '📄' },
                    { format: 'AI', icon: '✏️' },
                    { format: 'EPS', icon: '🎯' },
                    { format: 'PSD', icon: '🖌️' },
                    { format: 'CDR', icon: '📐' },
                    { format: 'SVG', icon: '⭐' },
                  ].map((file, index) => (
                    <div key={index} className="text-center p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-default">
                      <span className="text-3xl mb-2 block filter drop-shadow-lg">{file.icon}</span>
                      <span className="font-bold text-slate-200 text-sm">{file.format}</span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-slate-500 text-xs mt-6">*Ukuran maksimal file upload adalah 10MB/file. Untuk file di atas kapasitas, silakan sertakan link Google Drive di catatan.</p>
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details key={index} className="group bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex justify-between items-center cursor-pointer p-6 list-none font-semibold text-slate-200 hover:text-blue-400 transition-colors">
                      <span className="pr-6">{faq.question}</span>
                      <span className="transition duration-300 group-open:-rotate-180 flex-shrink-0">
                        <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 pt-4 bg-slate-800/20">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </section>

      {/* CTA Section - Seamless Dark Card */}
      <section className="pb-24 relative z-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 to-blue-900/30 border border-slate-700/50 p-10 md:p-14 text-center shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 bg-blue-500/5 blur-[100px] pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
                Siap Memulai Proyek Anda?
              </h2>
              <p className="text-slate-400 mb-10 text-lg max-w-2xl mx-auto">
                Mulai unggah desain Anda sekarang atau hubungi tim kami untuk konsultasi teknis seputar kebutuhan cetak partai besar.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products"
                  className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
                >
                  Mulai Pesan
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-3.5 rounded-xl border border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all font-bold"
                >
                  Hubungi Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  )
}