<script setup lang="ts">
import { useAvatarTransferStore } from '@/stores/useAvatarTransferStore';

useHead({
  title: 'change nornoe\'s avatar',
})

const avatarStore = useAvatarTransferStore()
const avatarParams = computed(() => avatarStore.avatar)
</script>

<template>
    <div id="index">
        <NuxtLink to="/gallery" class="link-button">
            <Icon name="fluent-emoji-high-contrast:framed-picture" size="16"/>
            avatar gallery
        </NuxtLink>
        <h1>nornoe's avatar maker</h1>
        <AvatarPreview :params="avatarParams" />
        <p>
            Change the shape, the face, the color and the orientation of this avatar. When you confirm, it will update my <a href="https://bsky.app/profile/nornoe.bsky.social" target="_blank">Bluesky</a> avatar.
            Keep in mind, to avoid spam, you can only change it every 5 minutes!
        </p>
    </div>
</template>

<style lang="scss" scoped>
#index {
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
}
h1 {
  text-align: center;
  margin-bottom: 1em;
}

p {
  margin: 2rem auto;
  max-width: 920px;
  font-size: 1.5rem;
}
</style>
