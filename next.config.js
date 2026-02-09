/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Cloudflare Pages configuration
  trailingSlash: false,
}

module.exports = nextConfig
