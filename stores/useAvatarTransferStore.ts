import { defineStore } from 'pinia'
import type { AvatarParams } from '@/types/avatarArchiveResponse'

export const useAvatarTransferStore = defineStore('avatarTransfer', () => {
  const avatar = ref<AvatarParams | null>(null)

  function setAvatar(data: AvatarParams) {
    avatar.value = data
  }

  function clearAvatar() {
    avatar.value = null
  }

  return {
    avatar,
    setAvatar,
    clearAvatar,
  }
})
