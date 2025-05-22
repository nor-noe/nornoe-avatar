import type { AvatarParams } from '@/types/avatarArchiveResponse'

const STORAGE_KEY = 'avatar-draft'

export function useAvatarDraft() {
  const saveDraft = (params: AvatarParams) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(params))
    } catch (e) {
      console.error('Failed to save avatar draft', e)
    }
  }

  const loadDraft = (): AvatarParams | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      console.error('Failed to load avatar draft', e)
      return null
    }
  }

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    saveDraft,
    loadDraft,
    clearDraft,
  }
}
