// this route serves as a test

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const targetUrl = `${config.API_URL}/hello`

    try {
        const response = await $fetch(targetUrl, {
        method: 'GET',
        })

        return response
        
    } catch (err: any) {
        console.error('Error in hello:', err)
    }
})