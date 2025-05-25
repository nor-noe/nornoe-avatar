import { AtpAgent } from "@atproto/api"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await getUserSession(event)

  const body = await readBody(event)
  let handle = null

  const targetUrl = `${config.API_URL}/setAvatar`

  const did = user.user ? (user.user as any).bluesky : null
  if (did) {
    const agent = new AtpAgent({ service: 'https://public.api.bsky.app' })

    try {
    const res = await agent.app.bsky.actor.getProfile({
      actor: did,
    })

      handle = res.data.handle
    } catch (err) {
      console.error(`Failed to resolve handle for DID ${did}:`, err)
      handle = null
    }
  }

  try {
    const response = await $fetch(targetUrl, {
      method: 'POST',
      body: {
        ...body,
        author: {
          did: did,
          handle: handle,
        },
      },
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
