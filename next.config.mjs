/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
  },
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' }
    return config
  },
}

export default nextConfig
