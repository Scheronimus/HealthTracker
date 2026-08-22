import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { deployment, deploymentAsset } from './deployment.config.mjs'

export default defineConfig({
  base: deployment.basePath,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'app-icon.svg', 'app-icon-192.png', 'app-icon-512.png'],
      manifest: {
        name: 'Health Tracker',
        short_name: 'Health',
        description: 'Private, offline health measurement tracking',
        theme_color: '#245a7a',
        background_color: '#f5f8fa',
        display: 'standalone',
        start_url: deployment.basePath,
        scope: deployment.basePath,
        icons: [
          { src: deploymentAsset('app-icon-192.png'), sizes: '192x192', type: 'image/png' },
          { src: deploymentAsset('app-icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  test: { environment: 'node' },
})
