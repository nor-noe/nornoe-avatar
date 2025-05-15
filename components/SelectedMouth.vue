<script lang="ts">
export const mouthMap = {
    smile: Smile,
    tongue: Tongue,
    frown: Frown,
    woozy: Woozy,
    chubby: Chubby,
    kiss: Kiss,
}

export type MouthType = keyof typeof mouthMap;
</script>

<script lang="ts" setup>
import Chubby from '@/assets/images/mouth/chubby.svg'
import Frown  from '@/assets/images/mouth/frown.svg'
import Kiss from '@/assets/images/mouth/kiss.svg'
import Smile from '@/assets/images/mouth/smile.svg'
import Tongue from '@/assets/images/mouth/tongue.svg'
import Woozy from '@/assets/images/mouth/woozy.svg'


const props = defineProps<{
  type: MouthType
}>()

const SelectedComponent = computed(() => mouthMap[props.type])
</script>

<template>
    <component :is="SelectedComponent" />
</template>