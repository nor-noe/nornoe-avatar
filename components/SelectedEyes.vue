<script lang="ts">
export const eyesMap = {
    opened: Opened,
    closed: Closed,
    wink: Wink,
    squint: Squint,
    bored: Bored,
    woozy: Woozy,
    glasses: Glasses,
    sunglasses: Sunglasses,
    'crossed-out': CrossedOut,
    pleading: Pleading,
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
import Glasses from '@/assets/images/eyes/glasses.svg'
import Sunglasses from '@/assets/images/eyes/sunglasses.svg'
import CrossedOut from '@/assets/images/eyes/crossed-out.svg'
import Pleading from '@/assets/images/eyes/pleading.svg'

const props = defineProps<{
  type: EyesType
}>()

const SelectedComponent = computed(() => eyesMap[props.type])
</script>

<template>
    <component :is="SelectedComponent" />
</template>