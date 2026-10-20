/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'incharacter.cloud' },
    ],
  },
  // Alaron Chronicle: static build in public/chronicle (source in chronicle/). Login-gated by middleware.
  async rewrites() {
    return [{ source: '/chronicle', destination: '/chronicle/index.html' }]
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['incharacter.cloud', 'localhost:3000'],
    },
  },
}

export default nextConfig
