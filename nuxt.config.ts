export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/eslint'],

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    storageKey: 'nuxt-color-mode',
  },

  vite: {
    optimizeDeps: {
      include: [
        '@photo-sphere-viewer/core',
        '@photo-sphere-viewer/virtual-tour-plugin',
      ],
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['node'],
      },
    },
  },

  runtimeConfig: {
    panoDir: process.env.PANO_DIR ?? './data',
  },
})
