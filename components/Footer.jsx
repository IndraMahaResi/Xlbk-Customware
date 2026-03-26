import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0B1120] border-t border-slate-800/50 pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Kolom 1: Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="inline-block text-2xl font-extrabold bg-gradient-to-r from-slate-100 to-blue-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              XLBK Customwear
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Platform custom merchandise premium. Melayani pembuatan kaos, mug, tumbler, dan souvenir tanpa minimum order. Mendukung pembayaran Fiat & Crypto.
            </p>
          </div>

          {/* Kolom 2: Tautan Cepat (Disesuaikan dengan konten HowToOrder) */}
          <div>
            <h3 className="text-slate-100 font-semibold mb-6 uppercase tracking-wider text-sm">Navigasi</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>
                <Link href="/products" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                   Katalog Produk
                </Link>
              </li>
              <li>
                <Link href="/how-to-order" className="hover:text-blue-400 transition-colors">
                  Panduan Pemesanan
                </Link>
              </li>
              <li>
                <Link href="/how-to-order" className="hover:text-blue-400 transition-colors">
                  Tips Desain Cetak
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-400 transition-colors">
                  Pertanyaan (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400 transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              {/* 🔥 TOMBOL RAHASIA ADMIN (Easter Egg) */}
              <li className="pt-2">
                <Link href="/dashboard" className="text-slate-600 hover:text-blue-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 inline-block transition-colors"></span>
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak & Alamat */}
          <div>
            <h3 className="text-slate-100 font-semibold mb-6 uppercase tracking-wider text-sm">Hubungi Kami</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500 shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="leading-relaxed">
                  Jl. Albasia 3 Perum Papan Indah No 29 Rt 09/RW 09,<br />
                  Mangunjaya, Tambun Selatan,<br />
                  Kab. Bekasi, Jawa Barat
                </span>
              </li>
              <li className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <a href="mailto:xlbk.customwear@gmail.com" className="hover:text-blue-400 transition-colors">xlbk.customwear@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
                <a href="https://wa.me/6281283433771" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">+62 812-8343-3771</a>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Sosial Media & Marketplace */}
          <div>
            <h3 className="text-slate-100 font-semibold mb-6 uppercase tracking-wider text-sm">Temukan Kami</h3>
            <div className="flex gap-4">
              <a href="https://instagram.com/xlbk.customwear" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://shopee.co.id/xlbkcustomwear" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#EE4D2D] hover:text-white transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(238,77,45,0.4)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </a>
              <a href="mailto:xlbk.customwear@gmail.com" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Garis Pembatas Bawah */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {currentYear} XLBK Customwear. All rights reserved.</p>
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