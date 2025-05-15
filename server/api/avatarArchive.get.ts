import { defineEventHandler } from 'h3'
import { AtpAgent } from '@atproto/api'

export default defineEventHandler(async () => {
    const config = useRuntimeConfig()

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
        limit: 100, // TODO: Pagination
    })

    return res
})
