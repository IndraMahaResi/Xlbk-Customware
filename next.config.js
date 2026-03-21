/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-domain.com'],
    unoptimized: process.env.NODE_ENV === 'development'
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}

module.exports = nextConfig