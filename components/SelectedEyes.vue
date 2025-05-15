<script lang="ts">
export const eyesMap = {
    opened: Opened,
    closed: Closed,
    wink: Wink,
    squint: Squint,
    bored: Bored,
    woozy: Woozy,
}

export type EyesType = keyof typeof eyesMap;
</script>

<script lang="ts" setup>
import Bored from '@/assets/images/eyes/bored.svg'
import Closed from '@/assets/images/eyes/closed.svg'
import Opened from '@/assets/images/eyes/opened.svg'
import Squint from '@/assets/images/eyes/squint.svg'
import Wink from '@/assets/images/eyes/wink.svg'
import Woozy from '@/assets/images/eyes/woozy.svg'

const props = defineProps<{
  type: EyesType
}>()

const SelectedComponent = computed(() => eyesMap[props.type])
</script>

<template>
    <component :is="SelectedComponent" />
</template>