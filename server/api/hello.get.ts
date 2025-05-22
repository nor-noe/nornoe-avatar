// this route serves as a test

export default defineEventHandler(async (event) => {

  const user = await getUserSession(event)


  console.log('GET /hello called')
  return { user }
})