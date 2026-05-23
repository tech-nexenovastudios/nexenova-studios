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
})
