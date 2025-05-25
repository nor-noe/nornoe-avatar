const oauthHandler = defineOAuthBlueskyEventHandler({
  async onSuccess(event, { user }) {
    await setUserSession(event, {
      user: {
        bluesky: user.did,
      },
      loggedInAt: Date.now(),
    })

    return sendRedirect(event, '/')
  },
})

// Wrapper to verify the handle parameter`
export default defineEventHandler(async (event) => {
  const url = new URL(event.req.url || '', `http://${event.req.headers.host}`)
  const handle = url.searchParams.get('handle')

  if (!handle) {
    // Redirection if no handle is provided
    return sendRedirect(event, '/', 302)
  }

  // Login otherwise
  return oauthHandler(event)
})
