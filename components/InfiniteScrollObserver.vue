<script setup lang="ts">
const props = defineProps<{
  handler: Function
}>()

const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const setupObserver = () => {
  if (!sentinel.value) return
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      props.handler()
    }
  })
  observer.observe(sentinel.value)
}

onMounted(setupObserver)
onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="infinite-scroll-observer" ref="sentinel">
    <slot></slot>
  </div>
</template>