export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const body = await readBody(event)

  const targetUrl = `${config.API_URL}/setAvatar`

  try {
    const response = await $fetch(targetUrl, {
      method: 'POST',
      body,
    })

    return response
    
  } catch (err: any) {
    console.error('Error in setAvatar:', err)
    return sendError(
      event,
      createError({
        statusCode: err?.response?.status || 500,
        statusMessage: err?.response?.statusText || 'Internal Server Error',
        data: err?.data || null,
        message: err?.data?.message || err?.message || 'Unknown error',
      })
    )
  }
})
