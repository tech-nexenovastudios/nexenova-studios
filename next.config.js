/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'nexenova-studios'
const basePath = isProd ? `/${repositoryName}` : ''
const assetPrefix = isProd ? `/${repositoryName}` : ''

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: basePath,
  assetPrefix: assetPrefix,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
