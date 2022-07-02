<template>
  <div class="relative group">
    <slot />
    <div class="absolute top-full translate-y-2 left-1/2 -translate-x-1/2 w-max text-white bg-neutral-800 text-sm font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none">
      {{ props.value }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  value: {
    type: String,
    default: 'Hello World',
  },
})
</script>