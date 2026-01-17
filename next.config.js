/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
// Extract repository name from GITHUB_REPOSITORY (format: "username/repo-name")
// Or use environment variable, or default to 'nexenova-studios'
const repositoryName = process.env.GITHUB_REPOSITORY 
  ? process.env.GITHUB_REPOSITORY.split('/')[1] 
  : (process.env.REPO_NAME || 'nexenova-studios')

// Only set basePath in production and if deploying to a subdirectory
// If deploying to username.github.io (root), set basePath to empty string
const basePath = isProd && repositoryName !== 'username.github.io' ? `/${repositoryName}` : ''
const assetPrefix = isProd && repositoryName !== 'username.github.io' ? `/${repositoryName}` : ''

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
