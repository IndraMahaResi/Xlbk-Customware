# 🚀 XLBK Customwear - E-Commerce & Dashboard Management

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

**XLBK Customwear** adalah aplikasi *full-stack web* modern untuk pemesanan pakaian *custom* (sablon kaos, mug, tumbler, dll). Dibangun menggunakan **Next.js (App Router)** dan **PostgreSQL**, aplikasi ini mengusung desain antarmuka *Fintech Dark Mode* (Glassmorphism) yang elegan, responsif, dan futuristik.

Aplikasi ini mencakup dua sisi utama: **Customer Order Flow** (untuk pelanggan memesan desain) dan **Admin Dashboard** (untuk mengelola inventaris, pesanan, dan analitik).

---

## ✨ Fitur Utama

### 🛍️ Sisi Pelanggan (Customer Facing)
- **Multi-step Checkout Wizard:** Alur pemesanan 4 langkah yang mulus (Pilih Produk ➔ Upload Desain ➔ Data Diri ➔ Pembayaran).
- **Custom Design Upload:** Mendukung unggah file gambar (.jpg, .png) dan dokumen vector (.pdf, .ai, .psd) menggunakan `react-dropzone`.
- **Multi-Payment Gateway UI:** Mendukung instruksi pembayaran dinamis untuk:
  - 🏦 Transfer Bank (BCA & Mandiri)
  - 📱 QRIS (E-Wallet & M-Banking)
  - 💎 Crypto (USDT TRC20 & Bitcoin)
- **Real-time Countdown:** Timer batas waktu pembayaran (*expired time*).
- **Digital Invoice:** Pelanggan dapat mengunduh struk/invoice dalam bentuk PDF.

### 🔐 Sisi Admin (Dashboard)
- **Secure Authentication:** Sistem Login & Register menggunakan JWT & Cookies.
- **Product Management:** CRUD produk katalog, lengkap dengan fitur **Bulk Upload via Excel (.xlsx)**.
- **Order Management:** Pantau pesanan masuk, ubah status pesanan (`PENDING`, `PROCESSING`, `COMPLETED`), dan validasi bukti pembayaran.
- **Advanced Analytics & Reports:** - Grafik pendapatan dinamis (Bar Chart).
  - Distribusi status pesanan (Progress Bar).
  - Kalkulasi Produk Terlaris (*Top Selling Products*).
  - Filter laporan berdasarkan rentang waktu (Minggu, Bulan, Kuartal, Tahun).

---

## 🛠️ Teknologi yang Digunakan

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Glassmorphism & Dark Mode)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Icons:** [Heroicons](https://heroicons.com/)
- **Utilities:** `react-hot-toast` (Notifikasi), `xlsx` (Excel Parser), `react-dropzone` (File Upload).

---

## ⚙️ Persyaratan Instalasi (Prerequisites)

Pastikan Anda telah menginstal *software* berikut di komputer Anda:
- **Node.js** (versi 18.17 atau lebih baru)
- **PostgreSQL** (berjalan di localhost atau *cloud provider* seperti Supabase/Neon)
- **Git** (Opsional)

---

## 🚀 Cara Menjalankan Proyek Lokal (Getting Started)

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer Anda:

**1. Clone Repository**
```bash
git clone [https://github.com/username-anda/xlbk-customwear.git](https://github.com/username-anda/xlbk-customwear.git)
cd xlbk-customwear

2. Instalasi Dependencies

Bash
npm install
3. Konfigurasi Environment Variables
Buat file bernama .env di direktori utama (root) proyek Anda, dan sesuaikan dengan konfigurasi database Anda:

Cuplikan kode
# Koneksi ke PostgreSQL Database Anda
DATABASE_URL="postgresql://postgres:password@localhost:5432/xlbk_customwear?schema=public"

# Secret Key untuk JWT Auth (Isi dengan string acak)
JWT_SECRET="rahasia_super_aman_xlbk_2026"
4. Migrasi Database (Prisma)
Sinkronkan skema Prisma dengan database PostgreSQL Anda dan buat Prisma Client:

Bash
npx prisma db push
npx prisma generate

xlbk-customwear/
├── app/
│   ├── api/               # Next.js API Routes (Backend)
│   │   ├── auth/          # Endpoint Login & Register
│   │   ├── orders/        # Endpoint Transaksi Pemesanan
│   │   ├── payments/      # Endpoint Validasi Pembayaran
│   │   ├── products/      # Endpoint Katalog Produk
│   │   └── reports/       # Endpoint Analitik & Chart
│   ├── dashboard/         # Halaman Admin (Protected Route)
│   ├── login/             # Halaman Autentikasi
│   ├── order/             # Alur Checkout Pelanggan
│   └── payment/           # Halaman Instruksi Pembayaran
├── components/            # Reusable UI Components (Navbar, Cards)
├── lib/                   # Utility functions (Prisma Client instance)
├── prisma/                
│   └── schema.prisma      # Definisi Skema Database
└── public/                # Static assets (Images, Icons)


### Tips Tambahan Sebelum Mem-*push* ke GitHub:
1. **Tambahkan Screenshot:** Jika Anda perhatikan di bagian *Header*, saya menyisipkan bagian untuk gambar. Anda bisa mengambil *screenshot* (*screenshot* halaman dashboard, *form order*, dan halaman struk pembayaran), lalu masukkan gambarnya ke folder Github Anda, dan tambahkan tautannya ke dalam file Markdown tersebut untuk menggantikan teks `[Tambahkan Gambar...]`.
2. **Jangan Push `.env`:** Pastikan Anda memiliki file `.gitignore` yang mendaftar `.env` di dalamnya, agar *password* database Anda tidak bocor ke publik.

Bagus sekali progres yang sudah Anda capai hingga tahap ini! Semua sistem utama sudah terhubung dengan baik. Ada yang ingin kita kerjakan selanjutnya?