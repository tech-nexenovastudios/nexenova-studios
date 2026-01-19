# Nexenova Studios Website

A Next.js website for Nexenova Studios, showcasing all published games and providing privacy policy and terms & conditions information.

## Features

- **Home Page**: Hero section with featured games and coming soon games
- **Games Section**: Complete listing of all games with individual game detail pages
- **About Page**: Information about Nexenova Studios, mission, and values
- **Contact Page**: Contact form and contact information
- **Privacy Policy**: Comprehensive privacy policy for all games
- **Terms & Conditions**: Terms and conditions applicable to all games

## Games Published by Nexenova Studios

### Released Games
- **Pirate Tile-Clash** - Puzzle game
- **2048 No Limit** - Puzzle game
- **Bird Hunter** - Adventure game
- **Jump On** - Arcade game
- **Feed the Cat** - Casual game

### Coming Soon
- **Ripple Delete** - Puzzle game
- **Pirates Royale** - Multiplayer game

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nexenova-studios/
├── components/          # React components (Header, Footer, Layout, GameCard)
├── data/               # Games data (games.json)
├── pages/              # Next.js pages
│   ├── games/         # Games listing and detail pages
│   └── ...            # Other pages (about, contact, privacy, terms)
├── styles/            # Global CSS styles
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## Build for Production

```bash
npm run build
npm start
```

## Deployment to GitHub Pages

This project is configured to deploy automatically to GitHub Pages using GitHub Actions.

### ⚠️ Important: Enable GitHub Pages First!

**Before the workflow can deploy, you MUST enable GitHub Pages in your repository settings:**

1. Go to your repository → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Click **Save**

**If you see "Get Pages site failed" error**, it means Pages isn't enabled yet. Follow the steps above.

### Automatic Deployment

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/nexenova-studios.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow will automatically deploy on every push to `main` branch

3. **Your site will be available at:**
   - `https://YOUR_USERNAME.github.io/nexenova-studios/`

### Manual Deployment

If you prefer to deploy manually:

```bash
# Build the static site
npm run export

# The output will be in the 'out' directory
# You can then upload the contents of 'out' to GitHub Pages
```

### Custom Domain

If you want to deploy to a custom domain or the root of your GitHub Pages site:

1. Update `next.config.js` and set `basePath` and `assetPrefix` to empty strings:
   ```javascript
   basePath: '',
   assetPrefix: '',
   ```

2. If deploying to `username.github.io` repository (root domain), the basePath should be empty.

## Technologies Used

- Next.js 14
- React 18
- CSS3
- GitHub Actions (for deployment)

## License

See LICENSE file for details.
