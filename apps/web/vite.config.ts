import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from https://0r1xByte.github.io/mezzanine_design/ via GitHub Pages.
  base: process.env.GITHUB_PAGES ? '/mezzanine_design/' : '/',
})
