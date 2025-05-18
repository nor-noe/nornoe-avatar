// composables/useAvatarArchive.ts
import { ref } from 'vue'
import { useFetch } from '#app'
import type { AvatarArchiveResponse, AvatarRecord } from '@/types/avatarArchiveResponse'

export const useAvatarArchive = (limit = 50) => {
  const records = ref<AvatarRecord[]>([])
  const loading = ref(false)
  const error = ref<unknown | null>(null)
  const cursor = ref<string | null>(null)
  const hasMore = ref(true)

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return
    
    loading.value = true
    try {
      const { data, error: fetchError } = await useFetch<AvatarArchiveResponse>('/api/avatarArchive', {
        params: {
          limit,
          cursor: cursor.value ?? undefined,
        },
      })

      if (fetchError.value) throw fetchError.value

      records.value.push(...data.value!.data.records)
      cursor.value = data.value!.data.cursor ?? null
      hasMore.value = !!cursor.value && data.value!.data.records.length > 0
    } catch (err) {
      console.error('[useAvatarArchive] Error:', err)
      error.value = err
      hasMore.value = false
    } finally {
      loading.value = false
    }
  }

  loadMore()

  return {
    records,
    loading,
    error,
    hasMore,
    loadMore,
  }
}
