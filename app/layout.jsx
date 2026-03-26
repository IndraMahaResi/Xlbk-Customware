import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Footer from '@/components/Footer' // <-- Import komponen Footer

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'XLBK Customwear | Platform Custom Merchandise',
  description:
    'Platform custom merchandise untuk membuat dan memesan produk seperti kaos, mug, tumbler, totebag, dan souvenir dengan desain sendiri.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} 
        bg-slate-950 /* 🔥 PERBAIKAN: Gunakan warna solid agar menyatu dengan Hero fade */
        text-slate-100 min-h-screen flex flex-col 
        antialiased selection:bg-blue-600 selection:text-white`}
      >

        {/* Decorative Background - Fintech / Modern E-commerce Vibe */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          {/* Top subtle glow */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 
          w-[800px] h-[500px] 
          bg-blue-600/10 
          rounded-full 
          blur-[120px]"></div>

          {/* Bottom corner accent */}
          <div className="absolute -bottom-32 -right-32 
          w-[600px] h-[600px] 
          bg-indigo-600/10 
          rounded-full 
          blur-[150px]"></div>
        </div>

        {/* Main Content Wrapper */}
        <main className="relative z-10 flex-grow flex flex-col">
          {children}
        </main>

        {/* Footer akan muncul di semua halaman */}
        <Footer />

        {/* Toaster - Dark Theme Fintech Style */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '12px', // Sedikit lebih melengkung agar modern
              background: '#0f172a', // slate-900
              color: '#f8fafc', // slate-50
              border: '1px solid #1e293b', // slate-800
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
              fontSize: '14px',
              fontWeight: '600',
            },
            success: {
              iconTheme: {
                primary: '#10b981', // emerald-500 (Lebih cocok untuk sukses di dark mode)
                secondary: '#0f172a',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e', // rose-500
                secondary: '#0f172a',
              },
            },
          }}
        />

      </body>
    </html>
  )
}