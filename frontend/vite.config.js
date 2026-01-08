import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl(), // Enable HTTPS for camera and GPS access on network
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['bapera.jpg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'AbsensiPintar - BAPERA',
        short_name: 'AbsensiPintar',
        description: 'Aplikasi Absensi dan Kunjungan Nasabah PT. BPR BAPERA BATANG',
        theme_color: '#3B82F6',
        background_color: '#3B82F6',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
<<<<<<< HEAD
            src: 'logo.svg',
=======
            src: '/icon-192.png',
>>>>>>> 9192d20189226cef059f41ee662f5bec0c28e5b2
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
<<<<<<< HEAD
            src: 'logo.svg',
=======
            src: '/icon-512.png',
>>>>>>> 9192d20189226cef059f41ee662f5bec0c28e5b2
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    https: true, // Enable HTTPS
    host: true,  // Expose to network (equivalent to --host flag)
  }
})
