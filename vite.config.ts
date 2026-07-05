import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Figma Make exports use `pkg@version` and `jsr:@scope/pkg@version` style
// imports. Strip the version suffix (and `jsr:` prefix) so Vite resolves
// them against the regular npm-installed packages.
function figmaVersionedImportResolver() {
  const versioned = /^(jsr:)?(@[^/]+\/[^@/]+|[^@/][^/]*)@[\d^~><=*xX.\-A-Za-z]+(\/.*)?$/
  return {
    name: 'figma-versioned-import-resolver',
    enforce: 'pre' as const,
    async resolveId(id, importer) {
      const match = id.match(versioned)
      if (!match) return null
      const stripped = match[2] + (match[3] ?? '')
      const resolved = await this.resolve(stripped, importer, { skipSelf: true })
      return resolved ?? stripped
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    figmaVersionedImportResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
    },
  },
  build: {
    // Every eagerly-loaded chunk is well under 500 kB. The only chunks that
    // exceed it are on-demand, dynamically-imported resume parsers that never
    // touch the initial/home load: the PDF.js worker (~1.2 MB) and the mammoth
    // DOCX parser + jszip (~500 kB), each fetched only when a user uploads that
    // file type on the careers form. Raise the limit past those so the warning
    // stays meaningful for the app bundle instead of firing on intended lazy libs.
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        // Group the shared, eagerly-loaded vendor libs into their own
        // long-cache chunks. Everything else — crucially the dynamically
        // imported libs (pdfjs-dist, mammoth and its deps) — is left to
        // Rollup's automatic per-import-graph chunking so those stay in
        // async chunks and are NOT pulled into the initial load. Do not add
        // a catch-all `return 'vendor'` here: it would force dynamic-only
        // deps into an eager chunk and defeat the code-splitting.
        // Route-level pages are split via React.lazy in Router.tsx.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/@radix-ui/')) return 'radix'
          if (id.includes('/motion') || id.includes('/framer-motion')) return 'motion'
          if (id.includes('/lucide-react/')) return 'icons'
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-is/') ||
            id.includes('/scheduler/')
          )
            return 'react'
        },
      },
    },
  },
})
