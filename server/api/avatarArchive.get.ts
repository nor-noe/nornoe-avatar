import { defineEventHandler, getQuery } from 'h3'
import { AtpAgent } from '@atproto/api'
import { AvatarRecord, AvatarArchiveResponse } from '@/types/avatarArchiveResponse'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const cursor = typeof query.cursor === 'string' ? query.cursor : undefined
  const limit = typeof query.limit === 'string' ? parseInt(query.limit) : 100

  const agent = new AtpAgent({ service: 'https://bsky.social' })

  await agent.login({
    identifier: config.BSKY_IDENTIFIER!,
    password: config.BSKY_PASSWORD!,
  })

  const did = agent.session?.did
  if (!did) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: DID not found',
    })
  }

  const res = await agent.com.atproto.repo.listRecords({
    repo: did,
    collection: 'net.nornoe.avatarArchive',
    limit,
    cursor,
  })

  const response: AvatarArchiveResponse = {
    data: {
      records: res.data.records as AvatarRecord[],
      cursor: res.data.cursor ?? '',
    },
    headers: {},
    success: true,
  }

  return response
})
