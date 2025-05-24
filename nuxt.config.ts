// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,

  nitro: {
    preset: 'netlify',
  },

  css: ['@/assets/styles/main.scss'],

  vite: {
    plugins: [require('vite-svg-loader')()],
  },

  modules: ['@nuxt/icon', '@pinia/nuxt'],

  runtimeConfig: {
    BSKY_IDENTIFIER: process.env.NUXT_BSKY_IDENTIFIER,
    BSKY_PASSWORD: process.env.NUXT_BSKY_PASSWORD,
    API_URL: process.env.NUXT_API_URL,
  },
})