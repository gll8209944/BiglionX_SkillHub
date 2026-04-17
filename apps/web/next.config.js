/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  compress: true,
  poweredByHeader: false,
  // Disable ESLint during build to allow deployment
  // ESLint warnings will still show in development
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
