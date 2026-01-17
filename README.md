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

## Technologies Used

- Next.js 14
- React 18
- CSS3

## License

See LICENSE file for details.
