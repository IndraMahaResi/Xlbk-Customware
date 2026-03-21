/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palet Fintech / Dark E-commerce
        primary: "#2563EB",   // Blue 600 - Biru utama yang profesional & dapat dipercaya
        secondary: "#1E293B", // Slate 800 - Warna gelap kebiruan untuk background kartu/elemen
        accent: "#38BDF8",    // Sky 400 - Biru neon terang untuk aksen dan efek glow
        darkbg: "#0B1120",    // Deep Navy - Warna latar belakang utama website
      },

      borderRadius: {
        // Dibuat sedikit lebih tegas (kurang membulat) untuk kesan serius & premium
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },

      boxShadow: {
        // Bayangan disesuaikan untuk Dark Mode (menggunakan alpha hitam yang lebih pekat)
        soft: "0 10px 30px rgba(0, 0, 0, 0.5)",
        // Efek cahaya berpendar khas UI modern / Web3 / Fintech
        glow: "0 0 20px rgba(37, 99, 235, 0.3)", 
        glowStrong: "0 0 30px rgba(56, 189, 248, 0.5)",
        // Efek bayangan kaca (glassmorphism) dengan pantulan cahaya tipis di atas (inset)
        glass: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      },

      backgroundImage: {
        // Utility tambahan untuk mempermudah pembuatan efek glass dan gradient
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      }
    },
  },
  plugins: [],
}