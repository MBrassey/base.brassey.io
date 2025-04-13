/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable type checking during build
  typescript: {
    ignoreBuildErrors: true
  },
  // Disable eslint during build
  eslint: {
    ignoreDuringBuilds: true
  },
  // Image domains
  images: {
    domains: ['cdn.brassey.io', 'i.imgur.com'],
    unoptimized: process.env.NODE_ENV === 'development'
  }
};

module.exports = nextConfig; 