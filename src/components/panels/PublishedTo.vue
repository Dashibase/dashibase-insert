<template>
  <div class="fixed bottom-4 right-4 border p-4 max-w-sm flex flex-col gap-2 rounded-md shadow bg-white z-10">
    <div class="font-semibold">
      Published to
    </div>
    <div class="flex w-full gap-2">
      <div class="whitespace-nowrap border px-1 rounded relative overflow-hidden cursor-pointer h-max" :class="copied ? '' : 'truncate'" @click="copy">
        <span :class="copied ? 'opacity-0' : 'opacity-100'" :title="formUrl">{{ formUrl }}</span>
        <span class="absolute left-0 px-1" :class="copied ? 'opacity-100' : 'opacity-0'">Copied!</span>
      </div>
      <DuplicateIcon class="w-7 h-7 shrink-0 text-neutral-700 cursor-pointer hover:bg-neutral-100 p-1 rounded" @click="copy" />
      <ExternalLinkIcon class="w-7 h-7 shrink-0 text-neutral-700 cursor-pointer hover:bg-neutral-100 p-1 rounded" @click="open" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DuplicateIcon, ExternalLinkIcon } from '@heroicons/vue/outline'
import { copyToClipboard } from '@/utils/utils'

const props = defineProps({
  formId: {
    type: String,
    required: true,
  }
})

const copied = ref(false)
const formUrl = computed(() => {
  return `${window.location.origin}/f/${props.formId}`
})

function copy () {
  copyToClipboard(formUrl.value)
  copied.value = true
  setTimeout(() => copied.value = false, 1000)
}

function open () {
  window.open(formUrl.value, '_blank')?.focus()
}
</script>
