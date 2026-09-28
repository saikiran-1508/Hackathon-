import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Lets the dev server be reached through a Cloudflare/localtunnel quick
    // tunnel for temporary sharing, without allowing literally any hostname.
    allowedHosts: ['.trycloudflare.com', '.loca.lt'],
  },
})
