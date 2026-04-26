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
        primary: "#2563EB",   // Blue 600
        secondary: "#1E293B", // Slate 800
        accent: "#38BDF8",    // Sky 400
        darkbg: "#0B1120",    // Deep Navy
      },

      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },

      // 🟢 KONFIGURASI ANIMASI BARU
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      // 🟢 KEYFRAMES UNTUK BANNER ELEGAN
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'shimmer': {
          '0%': { 'transform': 'translateX(-100%)' },
          '100%': { 'transform': 'translateX(100%)' },
        }
      },

      boxShadow: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.5)",
        glow: "0 0 20px rgba(37, 99, 235, 0.3)", 
        glowStrong: "0 0 30px rgba(56, 189, 248, 0.5)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      },

      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      }
    },
  },
  plugins: [],
}