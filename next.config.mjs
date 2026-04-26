/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'incharacter.cloud' },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['incharacter.cloud', 'localhost:3000'],
    },
  },
}

export default nextConfig
