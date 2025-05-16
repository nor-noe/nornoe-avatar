<script setup lang="ts">
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { AvatarArchiveResponse, AvatarParams } from '@/types/avatarArchiveResponse'
import { useAvatarTransferStore } from '@/stores/useAvatarTransferStore'

useHead({
  title: 'avatar gallery',
})

dayjs.extend(duration)
dayjs.extend(relativeTime)

const router = useRouter()
const avatarStore = useAvatarTransferStore()


const { data, pending, error } = useFetch<AvatarArchiveResponse>('/api/avatarArchive')
const avatars = computed(() => {
    if (data.value)
    return data.value.data.records

    return []
})

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

function editAvatar(params: AvatarParams ) {
    avatarStore.setAvatar(params)

    router.push('/')
}
</script>

<template>
    <div id="gallery">
        <NuxtLink to="/" class="link-button">
            <Icon name="fluent-emoji-high-contrast:left-arrow" size="16"/>
            back
        </NuxtLink>
        <h1>avatar gallery</h1>
        <div v-if="pending">Loading...</div>
        <div v-else-if="error">Error loading avatars</div>
        <div v-else class="avatars">
            <div v-for="(avatar, index) in avatars" :key="avatar.cid" class="avatar">
                <img
                    :src="`https://cdn.bsky.app/img/avatar/plain/${avatar.uri.split('/')[2]}/${avatar.value.blob.ref?.ref?.['$link']}@png`"
                    alt="Archived avatar"
                />
                <div class="avatar-infos">
                    <div class="avatar-duration">
                        <Icon name="fluent-emoji-high-contrast:timer-clock" size="16"/>
                        {{ formatDuration(avatar.value.createdAt, index > 0 ? avatars[index - 1].value.createdAt : undefined) }}
                    </div>
                    <div class="avatar-edit" @click="editAvatar(avatar.value.meta)">
                        <Icon name="fluent-emoji-high-contrast:pencil" size="16"/>
                        Edit
                    </div>
                </div>
            </div>
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
        display: flex;
        flex-wrap: wrap;
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
                font-size: 0.8rem;
                font-weight: bold;
                justify-content: center;
                align-items: center;
                box-sizing: border-box;
                flex-direction: column;
                gap: 0.5rem;

                .avatar-duration {
                    display: flex;
                    gap: 0.25rem;
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

            &:hover .avatar-infos {
                display: flex;
            }
        }
    }
}
</style>