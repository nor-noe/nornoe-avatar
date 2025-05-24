export default defineEventHandler(() => {
  const runtimeConfig = useRuntimeConfig()

  console.log('GET /hello called')
  return { message: `Hello from Nuxt API! ${runtimeConfig.BSKY_IDENTIFIER}` }
})