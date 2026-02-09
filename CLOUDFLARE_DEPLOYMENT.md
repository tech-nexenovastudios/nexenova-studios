# Cloudflare Pages Deployment Guide

This guide will help you deploy the Nexenova Studios website to Cloudflare Pages.

## Prerequisites

- A Cloudflare account (free tier works)
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 18+ installed locally (for testing builds)

## Deployment Options

### Option 1: Connect via Git (Recommended)

1. **Log in to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Workers & Pages** → **Pages**

2. **Create a New Project**
   - Click **Create a project** → **Connect to Git**
   - Authorize Cloudflare to access your Git provider
   - Select your repository (`nexenova-studios`)

3. **Configure Build Settings**
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/` (leave empty)
   - **Node.js version**: 18 or higher

4. **Environment Variables** (if needed)
   - Add any environment variables in the build settings
   - Example: `NODE_ENV=production`

5. **Deploy**
   - Click **Save and Deploy**
   - Cloudflare will automatically build and deploy your site
   - Future pushes to your main branch will trigger automatic deployments

### Option 2: Deploy via Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Build your site**
   ```bash
   npm run build
   ```

4. **Deploy to Cloudflare Pages**
   ```bash
   wrangler pages deploy out --project-name=nexenova-studios
   ```

## Build Configuration

The project is configured with:

- **Build command**: `npm run build`
- **Output directory**: `out` (Next.js static export)
- **Framework**: Next.js 14 with static export

### Configuration Files

- `next.config.js` - Next.js configuration (optimized for Cloudflare Pages)
- `wrangler.toml` - Cloudflare Pages configuration (optional, for CLI deployments)
- `public/_redirects` - Custom redirects (if needed)

## Automatic Deployments

Once connected via Git, Cloudflare Pages will automatically:
- Build your site on every push to the main branch
- Deploy the latest version
- Provide preview deployments for pull requests

## Custom Domain

To use a custom domain:

1. Go to your project in Cloudflare Pages
2. Click **Custom domains** → **Set up a custom domain**
3. Enter your domain name
4. Follow the DNS configuration instructions
5. Cloudflare will automatically configure SSL certificates

## Environment Variables

To add environment variables:

1. Go to your project → **Settings** → **Environment variables**
2. Add variables for Production, Preview, or both
3. Variables are available during build time as `process.env.VARIABLE_NAME`

## Build Settings Summary

```
Framework preset: Next.js (Static HTML Export)
Build command: npm run build
Build output directory: out
Root directory: /
Node.js version: 18
```

## Troubleshooting

### Build Fails

- Check the build logs in Cloudflare Pages dashboard
- Ensure Node.js version is 18 or higher
- Verify all dependencies are in `package.json`
- Test build locally: `npm run build`

### 404 Errors on Routes

- Next.js static export generates HTML files for each route
- Ensure `getStaticPaths` and `getStaticProps` are properly configured
- Check that all pages are being generated in the `out` directory

### Assets Not Loading

- Verify `next.config.js` doesn't have incorrect `basePath` or `assetPrefix`
- Check that static assets are in the `public` folder
- Clear Cloudflare cache if needed

### Deployment Not Triggering

- Ensure your Git repository is properly connected
- Check that you're pushing to the branch configured in build settings
- Verify webhook permissions in your Git provider

## Local Testing

Test your build locally before deploying:

```bash
# Install dependencies
npm install

# Build the site
npm run build

# The output will be in the 'out' directory
# You can serve it locally with:
npx serve out
# or
npx http-server out
```

## Performance Optimization

Cloudflare Pages automatically provides:
- Global CDN distribution
- Automatic SSL certificates
- DDoS protection
- Image optimization (via Cloudflare Images, if configured)

## Need Help?

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Static Export Guide](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- Check build logs in Cloudflare Pages dashboard
