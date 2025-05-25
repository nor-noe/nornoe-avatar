

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
  const url = new URL(event.node.req.url || '', `http://${event.node.req.headers.host}`)
  console.log(url)
  const handle = url.searchParams.get('handle')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (!handle && !state) {
    // Redirection if no handle is provided
    return sendRedirect(event, '/', 302)
  }

  if (error) {
    console.log('Error during OAuth:', error)
    // Handle the error case, e.g., redirect to an error page
    return sendRedirect(event, '/', 302)
  }

  // Login otherwise
  return oauthHandler(event)
})
