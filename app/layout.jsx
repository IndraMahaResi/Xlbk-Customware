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
        bg-[#0B1120] /* Latar belakang biru tua pekat ala Fintech */
        bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#111827] via-[#0B1120] to-[#020617]
        text-slate-100 min-h-screen flex flex-col 
        antialiased selection:bg-blue-600 selection:text-white`}
      >

        {/* Decorative Background - Fintech / Modern E-commerce Vibe */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Top subtle glow */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 
          w-[800px] h-[500px] 
          bg-blue-600/10 
          rounded-full 
          blur-[100px]"></div>

          {/* Bottom corner accent */}
          <div className="absolute -bottom-32 -right-32 
          w-[600px] h-[600px] 
          bg-indigo-600/10 
          rounded-full 
          blur-[120px]"></div>
        </div>

        {/* Main Content Wrapper */}
        <main className="relative z-0 flex-grow flex flex-col">
          {children}
        </main>

        {/* Footer akan muncul di semua halaman */}
        <Footer />

        {/* Toaster - Dark Theme Fintech Style */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '8px',
              background: '#1E293B', // slate-800
              color: '#F8FAFC', // slate-50
              border: '1px solid #334155', // slate-700
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#3B82F6', // blue-500
                secondary: '#1E293B',
              },
            },
          }}
        />

      </body>
    </html>
  )
}