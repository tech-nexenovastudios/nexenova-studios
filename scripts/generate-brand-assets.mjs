// Regenerates every derived brand asset from one master logo file.
//
//   node scripts/generate-brand-assets.mjs [path/to/master.png]
//
// Default master: brand/logo-star-master.png (kept out of public/ so the
// multi-megabyte original is never served). Outputs into public/:
//   favicon-16x16.png, favicon-32x32.png, favicon.ico   browser tabs
//   icon-192.png, icon-512.png                          PWA / manifest
//   icon-512-maskable.png                               manifest maskable slot
//   apple-touch-icon.png                                iOS home screen
//   logo-star.png                                       header/footer mark
//   og-image.jpg                                        social share card
//
// This is a one-shot tool, not part of `npm run build` — rerun it when the logo
// changes. Rendering is done with the Playwright Chromium that already ships as
// a devDependency, so there's no ImageMagick/sharp requirement.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const publicDir = resolve(root, 'public')

const master = resolve(root, process.argv[2] || 'brand/logo-star-master.png')
const masterDataUri = `data:image/png;base64,${readFileSync(master).toString('base64')}`

const BRAND_DARK = '#0a0a0a'

/** Square icon: the mark on a transparent or solid background. */
function iconHtml({ size, scale, background }) {
  return `<style>
    html,body{margin:0;padding:0;width:${size}px;height:${size}px;
      background:${background || 'transparent'};}
    .wrap{width:100%;height:100%;display:flex;align-items:center;justify-content:center;}
    img{width:${Math.round(size * scale)}px;height:auto;display:block;}
  </style>
  <div class="wrap"><img src="${masterDataUri}"></div>`
}

/** 1200x630 Open Graph card: mark + wordmark + one line of positioning. */
function ogHtml() {
  return `<style>
    @font-face{font-family:'System';src:local('Helvetica Neue'),local('Arial');}
    html,body{margin:0;padding:0;width:1200px;height:630px;}
    body{
      background:
        radial-gradient(900px 500px at 78% 18%, rgba(56,120,255,0.22), transparent 62%),
        radial-gradient(700px 480px at 12% 88%, rgba(124,77,255,0.20), transparent 60%),
        ${BRAND_DARK};
      color:#fff;
      font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
      display:flex;align-items:center;gap:64px;padding:0 84px;box-sizing:border-box;
    }
    .mark{width:280px;height:280px;flex:0 0 auto;
      filter:drop-shadow(0 24px 60px rgba(70,120,255,0.45));}
    .mark img{width:100%;height:100%;object-fit:contain;display:block;}
    .word{display:flex;align-items:baseline;gap:14px;}
    .word .n{font-size:82px;font-weight:700;letter-spacing:-2px;}
    .word .s{font-size:30px;font-weight:500;letter-spacing:8px;text-transform:uppercase;
      color:#7cc4ff;}
    .tag{margin-top:22px;font-size:31px;line-height:1.35;color:rgba(255,255,255,0.78);
      max-width:640px;font-weight:400;}
    .rule{margin-top:30px;width:132px;height:6px;border-radius:99px;
      background:linear-gradient(90deg,#4d7cff,#a05cff);}
  </style>
  <div class="mark"><img src="${masterDataUri}"></div>
  <div>
    <div class="word"><span class="n">Nexenova</span><span class="s">Studios</span></div>
    <div class="tag">AI-powered indie mobile game studio — puzzle, casual, arcade &amp; action games, made in India.</div>
    <div class="rule"></div>
  </div>`
}

/** Pack PNG buffers into a single .ico container (PNG-compressed entries). */
function buildIco(entries) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(entries.length, 4)

  let offset = 6 + entries.length * 16
  const dir = []
  for (const { size, data } of entries) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0) // width  (0 means 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1) // height
    entry.writeUInt8(0, 2) // palette
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // colour planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += data.length
    dir.push(entry)
  }
  return Buffer.concat([header, ...dir, ...entries.map((e) => e.data)])
}

const browser = await chromium.launch()

async function shoot({ html, width, height, omitBackground = true, type = 'png', quality }) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  })
  await page.setContent(html)
  await page.waitForLoadState('networkidle')
  const buffer = await page.screenshot({
    type,
    ...(type === 'png' ? { omitBackground } : { quality }),
  })
  await page.close()
  return buffer
}

async function icon({ size, scale = 0.94, background = null }) {
  return shoot({
    html: iconHtml({ size, scale, background }),
    width: size,
    height: size,
    omitBackground: !background,
  })
}

const outputs = []

// Transparent marks — tab favicons, PWA icons, and the in-app header mark.
for (const size of [16, 32, 48, 192, 512]) {
  const data = await icon({ size })
  outputs.push({ size, data })
}
const bySize = Object.fromEntries(outputs.map((o) => [o.size, o.data]))

writeFileSync(resolve(publicDir, 'favicon-16x16.png'), bySize[16])
writeFileSync(resolve(publicDir, 'favicon-32x32.png'), bySize[32])
writeFileSync(resolve(publicDir, 'icon-192.png'), bySize[192])
writeFileSync(resolve(publicDir, 'icon-512.png'), bySize[512])
// The mark as rendered in the site header and footer (36px on screen, so 192
// covers 3x displays without shipping the 512 everywhere).
writeFileSync(resolve(publicDir, 'logo-star.png'), bySize[192])
writeFileSync(
  resolve(publicDir, 'favicon.ico'),
  buildIco([
    { size: 16, data: bySize[16] },
    { size: 32, data: bySize[32] },
    { size: 48, data: bySize[48] },
  ]),
)

// iOS home screen: no transparency (it composites on black), so give it the
// brand background with breathing room for the automatic rounded mask.
writeFileSync(
  resolve(publicDir, 'apple-touch-icon.png'),
  await icon({ size: 180, scale: 0.72, background: BRAND_DARK }),
)

// Maskable: Android crops to a circle/squircle, so the mark sits inside the
// 80% safe zone on an opaque background.
writeFileSync(
  resolve(publicDir, 'icon-512-maskable.png'),
  await icon({ size: 512, scale: 0.6, background: BRAND_DARK }),
)

// Social card as JPEG: the same 1200x630 render is ~300 kB as PNG and ~70 kB
// here, and some scrapers time out on heavy OG images.
writeFileSync(
  resolve(publicDir, 'og-image.jpg'),
  await shoot({
    html: ogHtml(),
    width: 1200,
    height: 630,
    omitBackground: false,
    type: 'jpeg',
    quality: 82,
  }),
)

await browser.close()
console.log('[brand] Wrote favicons, PWA icons, apple-touch-icon, logo-star.png, and og-image.jpg to public/.')
