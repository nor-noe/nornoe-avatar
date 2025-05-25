<script lang="ts">
export const mouthMap = {
    smile: Smile,
    tongue: Tongue,
    frown: Frown,
    woozy: Woozy,
    cheeky: Cheeky,
    kiss: Kiss,
    'teeth-out': TeethOut,
    opened: Opened,
    cringe: Cringe,
    shy: Shy
}

export type MouthType = keyof typeof mouthMap;
</script>

<script lang="ts" setup>
import Cheeky from '@/assets/images/mouth/cheeky.svg'
import Frown  from '@/assets/images/mouth/frown.svg'
import Kiss from '@/assets/images/mouth/kiss.svg'
import Smile from '@/assets/images/mouth/smile.svg'
import Tongue from '@/assets/images/mouth/tongue.svg'
import Woozy from '@/assets/images/mouth/woozy.svg'
import TeethOut from '@/assets/images/mouth/teeth-out.svg'
import Opened from '@/assets/images/mouth/opened.svg'
import Cringe from '@/assets/images/mouth/cringe.svg'
import Shy from '@/assets/images/mouth/shy.svg'


const props = defineProps<{
  type: MouthType
}>()

const SelectedComponent = computed(() => mouthMap[props.type])
</script>

<template>
    <component :is="SelectedComponent" />
</template>