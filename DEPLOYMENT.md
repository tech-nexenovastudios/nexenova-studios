# GitHub Pages Deployment Guide

This guide will help you deploy the Nexenova Studios website to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your local machine

## Step-by-Step Deployment

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name it `nexenova-studios` (or your preferred name)
4. Choose **Public** (required for free GitHub Pages)
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 2. Push Your Code to GitHub

Open your terminal in the project directory and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Nexenova Studios website"

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/nexenova-studios.git

# Push to main branch
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. The workflow will automatically run and deploy your site

### 4. Wait for Deployment

1. Go to the **Actions** tab in your repository
2. You should see a workflow run called "Deploy to GitHub Pages"
3. Wait for it to complete (usually 2-3 minutes)
4. Once it shows a green checkmark, your site is deployed!

### 5. Access Your Site

Your website will be available at:
- `https://YOUR_USERNAME.github.io/nexenova-studios/`

**Note:** It may take a few minutes for the site to be accessible after the first deployment.

## Automatic Updates

Every time you push changes to the `main` branch, GitHub Actions will automatically:
1. Build your Next.js site
2. Deploy it to GitHub Pages
3. Update your live website

## Troubleshooting

### Site Not Loading

- Wait 5-10 minutes after first deployment
- Check the Actions tab to ensure the workflow completed successfully
- Verify GitHub Pages is enabled in Settings → Pages

### 404 Errors on Game Pages

- Make sure `getStaticPaths` and `getStaticProps` are properly configured (already done)
- Rebuild and redeploy

### Styling Issues

- Clear your browser cache
- Check that the basePath is correctly set in `next.config.js`

## Custom Domain (Optional)

If you have a custom domain:

1. Add a `CNAME` file in the `public` folder with your domain
2. Update your domain's DNS settings
3. Configure the custom domain in GitHub Pages settings

## Manual Deployment

If you prefer to deploy manually:

```bash
# Build the static site
npm run export

# The output will be in the 'out' directory
# Upload the contents to GitHub Pages manually
```

## Need Help?

- Check GitHub Actions logs in the Actions tab
- Review the workflow file: `.github/workflows/deploy.yml`
- Ensure all dependencies are listed in `package.json`
