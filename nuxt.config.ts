// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,

  devServer: {
    host: '127.0.0.1',
  },

  nitro: {
    preset: 'netlify-edge',

    node: false,

    externals: {
      inline: ['consola', 'multiformats'],
    },
  },

  // build: {
  //   transpile: ['@atproto/api', '@atproto/oauth-client-node']
  // },

  css: ['@/assets/styles/main.scss'],

  vite: {
    plugins: [require('vite-svg-loader')()],
    esbuild: {
      target: 'es2020',
    },
    // resolve: {
    //   alias: {
    //     // Specific paths for multiformats 9.9.0
    //     'multiformats/cjs/src/bases/base64.js': 'multiformats/src/bases/base64.js',
    //     'multiformats/bases/base64': 'multiformats/src/bases/base64.js'
    //   }
    // },
    // optimizeDeps: {
    //   include: ['@atproto/api', '@atproto/oauth-client-node', 'multiformats']
    // }
  },

  modules: ['@nuxt/icon', '@pinia/nuxt', 'nuxt-auth-utils'],

  auth: {
    atproto: true,
  },

  runtimeConfig: {
    BSKY_IDENTIFIER: process.env.NUXT_BSKY_IDENTIFIER,
    BSKY_PASSWORD: process.env.NUXT_BSKY_PASSWORD,
    API_URL: process.env.NUXT_API_URL,
  },
})