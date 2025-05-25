<script setup lang="ts">
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { AvatarParams } from '@/types/avatarArchiveResponse'
import { useAvatarTransferStore } from '@/stores/useAvatarTransferStore'
import { useAvatarArchive } from '@/composables/useAvatarArchive'

useHead({
  title: 'avatar gallery',
})

dayjs.extend(duration)
dayjs.extend(relativeTime)

const router = useRouter()
const avatarStore = useAvatarTransferStore()

const {
  records: avatars,
  loading,
  error,
  loadMore,
  hasMore,
} = useAvatarArchive()

const activeAvatarIndex = ref<number | null>(null)

function toggleAvatarInfo(index: number) {
  // On toggle l'état actif si c'est un mobile (ou si click)
  if (activeAvatarIndex.value === index) {
    activeAvatarIndex.value = null
  } else {
    activeAvatarIndex.value = index
  }
}


function formatDuration(from: string | Date, to: string | Date = new Date()): string {
  const diffMs = dayjs(to).diff(dayjs(from))
  const dur = dayjs.duration(diffMs)

  const days = dur.days()
  const hours = dur.hours()
  const minutes = dur.minutes()

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}min`)

  return parts.join(' ')
}

function editAvatar(params: AvatarParams) {
  avatarStore.setAvatar(params)
  router.push('/')
}

const scrollObserver = ref()
</script>


<template>
    <div id="gallery">
        <NuxtLink to="/" class="link-button">
            <Icon name="fluent-emoji-high-contrast:left-arrow" size="16"/>
            back
        </NuxtLink>
        <h1>avatar gallery</h1>
        <div v-if="error">Error loading avatars</div>
        <div v-else class="avatars">
            <div 
                v-for="(avatar, index) in avatars" 
                :key="avatar.cid" 
                class="avatar" 
                :class="{ 'show-infos': activeAvatarIndex === index }"
                @click="toggleAvatarInfo(index)"
            >
                <img
                    :src="`https://cdn.bsky.app/img/avatar/plain/${avatar.uri.split('/')[2]}/${avatar.value.blob.ref?.ref?.['$link']}@png`"
                    alt="Archived avatar"
                />
                <div class="avatar-infos" @click.stop>
                    <div class="avatar-duration">
                        <Icon class="icon" name="fluent-emoji-high-contrast:timer-clock"/>
                        {{ formatDuration(avatar.value.createdAt, index > 0 ? avatars[index - 1].value.createdAt : undefined) }}
                    </div>
                    <div class="avatar-author" v-if="avatar.value.meta.author?.handle">
                        <Icon class="icon" name="fluent-emoji-high-contrast:bust-in-silhouette"/>
                        <a :href="`https://bsky.app/profile/${avatar.value.meta.author.did}`" target="_blank">
                            {{ avatar.value.meta.author.handle }}
                        </a>
                    </div>
                    <div class="avatar-edit" @click="editAvatar(avatar.value.meta)">
                        <Icon class="icon" name="fluent-emoji-high-contrast:pencil"/>
                        Edit
                    </div>
                </div>
            </div>
            <InfiniteScrollObserver v-if="hasMore" :handler="loadMore" ref="scrollObserver">
                <div v-if="loading" class="loader">
                    <Icon name="fluent-emoji-high-contrast:hourglass-not-done" size="32" class="loader-icon"/>
                </div>
            </InfiniteScrollObserver>
        </div>
    </div>
</template>

<style lang="scss" scoped>
#gallery {
    .link-button {
        display: flex;
        align-items: center;
        width: fit-content;
        font-size: 1rem;
        text-decoration: none;
        color: #000;
        background-color: #f0f0f0;
        padding: 1rem;
        border-radius: 8px;
        gap: 0.5rem;

        &:hover {
            background-color: #e0e0e0;
        }
    }
    .avatars {
        margin-top: 2rem;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1rem;

        .avatar {
            border-radius: 50%;
            overflow: hidden;
            width: 160px;
            height: 160px;
            position: relative;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .avatar-infos {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                color: white;
                padding: 0.5rem;
                text-align: center;
                display: none;
                font-size: 0.75rem;
                font-weight: bold;
                justify-content: center;
                align-items: center;
                box-sizing: border-box;
                flex-direction: column;
                gap: 0.5rem;

                .avatar-author {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    
                    a {
                        color: white;
                        text-decoration: none;
                        
                        &:hover {
                            text-decoration: underline;
                        }
                    }
                }

                .avatar-duration {
                    display: flex;
                    gap: 0.25rem;
                    align-items: center;
                }

                .avatar-edit {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    cursor: pointer;
                    &:hover {
                        text-decoration: underline;
                    }
                }
            }

            @media (min-width: 768px) {
                 &:hover .avatar-infos {
                    display: flex;
                }
            }

             @media  (max-width: 768px) { 
                &.show-infos .avatar-infos {
                    display: flex;
                }
             }
        }

        @media  (max-width: 768px) {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 0.5rem;

            .avatar {
                width: 100px;
                height: 100px;

                .avatar-infos {
                    font-size: 0.5rem;
                }
            }
        }
    }

    .loader {
        width: 160px;
        height: 160px;
        background: #ccc;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;

        @media (max-width: 768px) {
            width: 100px;
            height: 100px;
        }

        .loader-icon {
            animation: spin 2s ease-in-out infinite;
        }
    }
}

@keyframes spin {
    0% {
    transform: rotate(0deg) translateY(0);
  }
  5% {
    transform: rotate(0deg) translateY(-3px);
  }
  10% {
    transform: rotate(0deg) translateY(0);
  }
  25% {
    transform: rotate(180deg) translateY(0);
  }
  50% {
    transform: rotate(180deg) translateY(0);
  }
  55% {
    transform: rotate(180deg) translateY(-3px);
  }
  60% {
    transform: rotate(180deg) translateY(0);
  }
  75% {
    transform: rotate(360deg) translateY(0);
  }
  100% {
    transform: rotate(360deg) translateY(0);
  }
}
</style>