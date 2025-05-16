export default defineEventHandler(() => {
  console.log('GET /hello called')
  return { message: 'Hello from Nuxt API!' }
})