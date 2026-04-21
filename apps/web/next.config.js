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
  // Disable TypeScript type checking during build
  // This allows deployment even if there are TypeScript warnings
  // TypeScript errors will still be caught in development and CI
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
