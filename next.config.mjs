/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for production
  reactStrictMode: true,
  
  // ESLint configuration - only ignore during builds in development
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // TypeScript configuration - only ignore during builds in development
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  
  // Image optimization
  images: {
    unoptimized: false, // Enable optimization for production
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/solana-labs/token-list/main/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'api.jup.ag',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'clipper.exchange',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Output configuration for Vercel
  output: 'standalone',
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
